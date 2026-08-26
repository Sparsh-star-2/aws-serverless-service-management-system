import json
import boto3
import pymysql

secrets_client = boto3.client("secretsmanager")
sns_client = boto3.client("sns")

SECRET_NAME = "service-management-db-credentials"

DB_HOST = "service-management-db.cxie2auuq2xn.ap-southeast-2.rds.amazonaws.com"
DB_NAME = "servicemanagement"

SNS_TOPIC_ARN = "arn:aws:sns:ap-southeast-2:654549798259:serviceflow-critical-alerts"

VALID_PRIORITIES = ["LOW", "NORMAL", "HIGH", "CRITICAL"]
VALID_STATUSES = ["OPEN", "IN PROGRESS", "RESOLVED"]


def get_connection():

    secret_response = secrets_client.get_secret_value(
        SecretId=SECRET_NAME
    )

    secret = json.loads(secret_response["SecretString"])

    return pymysql.connect(
        host=DB_HOST,
        user=secret["username"],
        password=secret["password"],
        database=DB_NAME,
        port=3306,
        connect_timeout=5,
        cursorclass=pymysql.cursors.DictCursor
    )


def response(status_code, body):

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
        },
        "body": json.dumps(body)
    }


def send_critical_alert(ticket_id, title, description):

    message = f"""
ServiceFlow - Critical Ticket Alert

A new CRITICAL priority ticket has been created.

Ticket ID: #{ticket_id}

Title:
{title}

Description:
{description or "No description provided."}

Priority:
CRITICAL

Status:
OPEN

Action Required:
Please review this ticket immediately.

---
ServiceFlow
AWS Service Management System
"""

    sns_client.publish(
        TopicArn=SNS_TOPIC_ARN,
        Subject=f"ServiceFlow Critical Alert - Ticket #{ticket_id}",
        Message=message
    )


def lambda_handler(event, context):

    connection = None

    try:

        method = event.get("httpMethod")

        path_parameters = event.get("pathParameters") or {}

        ticket_id = path_parameters.get("id")


        # =========================
        # CORS
        # =========================

        if method == "OPTIONS":

            return response(200, {
                "message": "CORS preflight successful"
            })


        connection = get_connection()


        # =========================
        # GET /tickets
        # =========================

        if method == "GET" and not ticket_id:

            with connection.cursor() as cursor:

                cursor.execute("""
                    SELECT id, title, description, priority, status,
                           created_at, updated_at
                    FROM tickets
                    ORDER BY id DESC
                """)

                tickets = cursor.fetchall()


            for ticket in tickets:

                ticket["created_at"] = ticket["created_at"].isoformat()

                ticket["updated_at"] = ticket["updated_at"].isoformat()


            return response(200, {
                "tickets": tickets
            })


        # =========================
        # GET /tickets/{id}
        # =========================

        if method == "GET" and ticket_id:

            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT id, title, description, priority, status,
                           created_at, updated_at
                    FROM tickets
                    WHERE id = %s
                    """,
                    (ticket_id,)
                )

                ticket = cursor.fetchone()


            if not ticket:

                return response(404, {
                    "message": "Ticket not found"
                })


            ticket["created_at"] = ticket["created_at"].isoformat()

            ticket["updated_at"] = ticket["updated_at"].isoformat()


            return response(200, ticket)


        # =========================
        # POST /tickets
        # =========================

        if method == "POST" and not ticket_id:

            body = json.loads(event.get("body") or "{}")

            title = body.get("title")

            description = body.get("description")

            priority = body.get("priority", "NORMAL")


            if not title:

                return response(400, {
                    "message": "Title is required"
                })


            if priority not in VALID_PRIORITIES:

                return response(400, {
                    "message": "Priority must be LOW, NORMAL, HIGH, or CRITICAL"
                })


            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    INSERT INTO tickets (title, description, priority)
                    VALUES (%s, %s, %s)
                    """,
                    (title, description, priority)
                )

                new_id = cursor.lastrowid


            connection.commit()


            # =========================
            # SNS CRITICAL ALERT
            # =========================

            if priority == "CRITICAL":

                try:

                    send_critical_alert(
                        new_id,
                        title,
                        description
                    )

                    print(
                        f"SNS critical alert sent for ticket #{new_id}"
                    )

                except Exception as sns_error:

                    print(
                        "SNS notification failed:",
                        str(sns_error)
                    )


            return response(201, {

                "message": "Ticket created successfully",

                "ticket_id": new_id

            })


        # =========================
        # PUT /tickets/{id}
        # =========================

        if method == "PUT" and ticket_id:

            body = json.loads(event.get("body") or "{}")

            title = body.get("title")

            description = body.get("description")

            priority = body.get("priority")

            status = body.get("status")


            if priority and priority not in VALID_PRIORITIES:

                return response(400, {
                    "message": "Priority must be LOW, NORMAL, HIGH, or CRITICAL"
                })


            if status and status not in VALID_STATUSES:

                return response(400, {
                    "message": "Invalid status"
                })


            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    UPDATE tickets
                    SET title = COALESCE(%s, title),
                        description = COALESCE(%s, description),
                        priority = COALESCE(%s, priority),
                        status = COALESCE(%s, status)
                    WHERE id = %s
                    """,
                    (
                        title,
                        description,
                        priority,
                        status,
                        ticket_id
                    )
                )

                updated = cursor.rowcount


            connection.commit()


            if updated == 0:

                return response(404, {
                    "message": "Ticket not found"
                })


            return response(200, {

                "message": "Ticket updated successfully",

                "ticket_id": int(ticket_id)

            })


        # =========================
        # DELETE /tickets/{id}
        # =========================

        if method == "DELETE" and ticket_id:

            with connection.cursor() as cursor:

                cursor.execute(
                    "DELETE FROM tickets WHERE id = %s",
                    (ticket_id,)
                )

                deleted = cursor.rowcount


            connection.commit()


            if deleted == 0:

                return response(404, {
                    "message": "Ticket not found"
                })


            return response(200, {

                "message": "Ticket deleted successfully",

                "ticket_id": int(ticket_id)

            })


        # =========================
        # METHOD NOT SUPPORTED
        # =========================

        return response(405, {
            "message": "Method not supported"
        })


    except Exception as e:

        print("ERROR:", str(e))

        return response(500, {

            "message": "Internal server error",

            "error": str(e)

        })


    finally:

        if connection:

            connection.close()
