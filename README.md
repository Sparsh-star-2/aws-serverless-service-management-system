# 🚀 Basic 3-Tier Serverless Service Management System

A serverless service management system built on **AWS** for creating and managing service tickets with database storage and email notifications.

The project demonstrates how AWS serverless services can be combined with a **secure 3-tier architecture** using **Amazon API Gateway, AWS Lambda, Amazon RDS MySQL, Amazon SNS, Amazon VPC, IAM, and CloudWatch**.

---

## 📌 Project Overview

The objective of this project was to build a basic service management system where users can create and manage service tickets through a web interface.

The application uses a serverless backend with **Amazon API Gateway and AWS Lambda**, stores ticket information in a **private Amazon RDS MySQL database**, and sends email notifications using **Amazon SNS**.

The architecture follows a basic 3-tier model:

```text
Presentation Tier
        │
        ▼
Application Tier
        │
        ▼
Data Tier
```

### Application Tiers

| Tier                  | Technology                     | Purpose                                         |
| --------------------- | ------------------------------ | ----------------------------------------------- |
| **Presentation Tier** | HTML, CSS, JavaScript          | Provides the user interface                     |
| **Application Tier**  | Amazon API Gateway, AWS Lambda | Handles API requests and application processing |
| **Data Tier**         | Amazon RDS for MySQL           | Stores service ticket data                      |

Additional AWS services are used for **notifications, security, networking, and monitoring**.

---

## 🏗️ Architecture

The main application request flow is:

```text
                         👤 USER
                            │
                            ▼
                 ┌────────────────────┐
                 │     FRONTEND       │
                 │    HTML / CSS / JS │
                 │ Presentation Tier  │
                 └─────────┬──────────┘
                           │
                           │ HTTP Requests
                           ▼
                 ┌────────────────────┐
                 │   API GATEWAY      │
                 │      REST API      │
                 │ Application Tier   │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │      LAMBDA        │
                 │   Python Backend   │
                 │ Application Tier   │
                 └─────────┬──────────┘
                           │
                           │ VPC
                           ▼
                 ┌────────────────────┐
                 │    RDS MySQL       │
                 │   Private Database │
                 │     Data Tier      │
                 └────────────────────┘
```

### Notification Flow

```text
                    Lambda
                       │
                       ▼
          ┌────────────────────────┐
          │ SNS VPC Interface      │
          │       Endpoint         │
          └────────────┬───────────┘
                       │
                       ▼
                Amazon SNS
                       │
                       ▼
                    📧 Email
```

### Supporting AWS Services

```text
                 ┌────────────────────┐
                 │        IAM         │
                 │  Access Control    │
                 └────────────────────┘

                 ┌────────────────────┐
                 │  Security Groups   │
                 │ Network Protection│
                 └────────────────────┘

                 ┌────────────────────┐
                 │    CloudWatch      │
                 │ Logs & Monitoring  │
                 └────────────────────┘
```

> Architecture diagram will be added here.

---

## ✨ Key Features

* Create service tickets
* Store ticket information in MySQL
* REST API using Amazon API Gateway
* Serverless backend using AWS Lambda
* Email notifications using Amazon SNS
* Private RDS database
* Lambda deployed inside a VPC
* VPC security groups for controlled access
* SNS access through a VPC Interface Endpoint
* IAM-based permissions
* CloudWatch logging and monitoring
* CORS enabled for frontend API requests

---

## ☁️ AWS Services Used

| AWS Service                | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| **Amazon VPC**             | Provides isolated network infrastructure   |
| **Amazon API Gateway**     | Provides REST API endpoints                |
| **AWS Lambda**             | Processes application requests             |
| **Amazon RDS MySQL**       | Stores service ticket data                 |
| **Amazon SNS**             | Sends ticket email notifications           |
| **VPC Interface Endpoint** | Provides private access from Lambda to SNS |
| **IAM**                    | Controls AWS service permissions           |
| **Security Groups**        | Controls network traffic                   |
| **Amazon CloudWatch**      | Provides logs and monitoring               |

---

## ⚙️ How It Works

The application follows a request-based serverless workflow.

### 1. User Interaction

The user submits a service ticket through the frontend.

```text
User
 │
 ▼
Frontend
```

### 2. API Request

The frontend sends the request to **Amazon API Gateway**.

```text
Frontend
   │
   ▼
API Gateway
```

### 3. Lambda Processing

API Gateway invokes the Lambda function, which validates and processes the ticket.

```text
API Gateway
     │
     ▼
Lambda
```

### 4. Database Storage

Lambda stores the ticket information in the **private RDS MySQL database**.

```text
Lambda
   │
   ▼
Private RDS MySQL
```

### 5. Email Notification

Lambda sends a notification through the **SNS VPC Interface Endpoint**.

```text
Lambda
   │
   ▼
SNS VPC Interface Endpoint
   │
   ▼
Amazon SNS
   │
   ▼
Email
```

### 6. Monitoring

Lambda execution activity and application logs are available through **Amazon CloudWatch**.

```text
Lambda
   │
   ▼
CloudWatch
```

---

## 🔌 API Endpoints

The backend provides REST API operations for service ticket management.

| Method   | Endpoint        | Purpose                     |
| -------- | --------------- | --------------------------- |
| `POST`   | `/tickets`      | Create a new service ticket |
| `GET`    | `/tickets`      | Retrieve service tickets    |
| `GET`    | `/tickets/{id}` | Retrieve a specific ticket  |
| `PUT`    | `/tickets/{id}` | Update a ticket             |
| `DELETE` | `/tickets/{id}` | Delete a ticket             |

---

## 📝 Example Ticket

A service ticket can be submitted using the following JSON structure:

```json
{
  "title": "Database Connection Issue",
  "description": "A database connection issue was detected and needs to be checked.",
  "priority": "HIGH"
}
```

### ✅ Successful Response

```json
{
  "message": "Ticket created successfully",
  "ticket_id": 11
}
```

---

## 🔐 Security & Permissions

The project uses several AWS security mechanisms to protect the application and its resources.

### Private Database

RDS is deployed privately and is **not directly exposed to the internet**.

### VPC Communication

Lambda communicates with RDS through the **VPC**.

### Security Groups

Security groups control traffic between application and database resources.

### IAM Permissions

IAM roles provide Lambda with the required AWS permissions.

### Private SNS Access

SNS is accessed through a **VPC Interface Endpoint**.

### Credential Protection

Database credentials are **not stored in the GitHub repository**.

---

## 📊 Monitoring

Amazon CloudWatch is used to monitor Lambda executions and troubleshoot application activity.

CloudWatch logs help verify:

* API requests
* Lambda executions
* Database operations
* SNS notification activity
* Application errors

This provides visibility into backend execution and helps identify problems during application operation.

---

## 📁 Project Structure

```text

    aws-serverless-service-management-system
    │
    ├── architecture/
    │   └── architecture.png
    │
    ├── backend/
    │   └── lambda_function.py
    │
    ├── frontend/
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    │
    ├── screenshots/
    │   ├── api-gateway-success.png
    │   ├── rds-database.png
    │   ├── lambda.png
    │   ├── sns-topic.png
    │   ├── email-notification.png
    │   └── cloudwatch-logs.png
    │
    └── README.md
```

---

## 🧪 Project Workflow

The complete service ticket workflow can be represented as:

```text
                    👤 USER
                       │
                       ▼
                ┌─────────────┐
                │  Frontend   │
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │ API Gateway │
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │   Lambda    │
                └──────┬──────┘
                       │
                 ┌─────┴─────┐
                 │           │
                 ▼           ▼
          ┌────────────┐  ┌────────────┐
          │ RDS MySQL  │  │    SNS     │
          │  Database  │  │ Notification│
          └────────────┘  └──────┬─────┘
                                  │
                                  ▼
                               📧 Email
```

---

## 🎯 Project Outcome

The project demonstrates a complete serverless workflow for service ticket management:

```text
Frontend
    ↓
API Gateway
    ↓
Lambda
    ↓
RDS MySQL
```

with automated notification:

```text
Lambda
    ↓
SNS
    ↓
Email
```

It also demonstrates practical AWS concepts including:

* VPC networking
* Private database deployment
* Security groups
* IAM permissions
* VPC endpoints
* Serverless computing
* REST APIs
* CloudWatch monitoring

---

## 🧰 Technologies Used

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Python
* MySQL

### AWS Services

* AWS Lambda
* Amazon API Gateway
* Amazon RDS
* Amazon SNS
* Amazon VPC
* AWS IAM
* Amazon CloudWatch

---

## 📸 Screenshots

Implementation screenshots are available in the `screenshots/` directory.

The screenshots include:

* API Gateway success
* RDS database
* Lambda
* SNS topic
* Email notification
* CloudWatch logs

The architecture diagram is available in:

```text
architecture/architecture.png
```

---

## 🎓 Key Learning Outcomes

Through this project, I gained practical experience with:

* Building a serverless AWS application
* Designing a basic 3-tier architecture
* Creating REST APIs using Amazon API Gateway
* Developing AWS Lambda functions
* Connecting Lambda with Amazon RDS MySQL
* Working with private RDS deployments
* Configuring AWS VPC networking
* Using VPC Interface Endpoints
* Configuring security groups
* Managing IAM permissions
* Implementing SNS email notifications
* Using CloudWatch for logging and monitoring
* Connecting a frontend application with AWS backend services

---

## 🚀 Conclusion

This project demonstrates how a service ticket management application can be built using a **serverless AWS architecture** while maintaining separation between the presentation, application, and data tiers.

The combination of **API Gateway, Lambda, RDS MySQL, SNS, VPC, IAM, Security Groups, and CloudWatch** provides hands-on experience with application development, cloud networking, security, database integration, notifications, and monitoring.

---

## 👨‍💻 Author

**Sparsh Jambhulkar**

AWS | Cloud | DevOps | Python

This project was built as a hands-on AWS and DevOps learning project.
