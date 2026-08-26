const API_URL =
    "https://jjbo1x7j7g.execute-api.ap-southeast-2.amazonaws.com/prod";

let allTickets = [];
let editingTicketId = null;

// =========================
// DOM ELEMENTS
// =========================

const ticketContainer = document.getElementById("ticketContainer");
const addTicketBtn = document.getElementById("addTicketBtn");
const ticketModal = document.getElementById("ticketModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelTicketBtn = document.getElementById("cancelTicketBtn");
const ticketForm = document.getElementById("ticketForm");
const refreshBtn = document.getElementById("refreshBtn");
const statusFilter = document.getElementById("statusFilter");

// =========================
// LOAD TICKETS
// =========================

async function loadTickets() {
    ticketContainer.innerHTML = `
        <div class="loading-state">
            <div class="loader"></div>
            <p>Loading service tickets...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/tickets`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        allTickets = data.tickets || [];

        displayTickets(allTickets);

    } catch (error) {
        console.error("Failed to load tickets:", error);

        ticketContainer.innerHTML = `
            <div class="loading-state">
                <p>Unable to load tickets.</p>
                <small>Please check the API connection.</small>
            </div>
        `;
    }
}

// =========================
// DISPLAY TICKETS
// =========================

function displayTickets(tickets) {

    updateStatistics(tickets);

    const selectedStatus = statusFilter.value;

    const filteredTickets =
        selectedStatus === "ALL"
            ? tickets
            : tickets.filter(
                ticket => ticket.status === selectedStatus
            );

    if (filteredTickets.length === 0) {
        ticketContainer.innerHTML = `
            <div class="loading-state">
                <p>No tickets found.</p>
            </div>
        `;
        return;
    }

    ticketContainer.innerHTML = filteredTickets.map(ticket => {

        /*
         * RESOLVED tickets:
         * Only Delete is available.
         *
         * OPEN / IN PROGRESS:
         * Edit + Delete are available.
         */

        const actionButtons =
            ticket.status === "RESOLVED"
                ? `
                    <button
                        class="delete-btn"
                        onclick="deleteTicket(${ticket.id})"
                    >
                        Delete
                    </button>
                `
                : `
                    <button
                        class="edit-btn"
                        onclick="editTicket(${ticket.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteTicket(${ticket.id})"
                    >
                        Delete
                    </button>
                `;

        return `
            <div class="ticket-card">

                <div class="ticket-main">

                    <div class="ticket-id">
                        #${ticket.id}
                    </div>

                    <div class="ticket-info">

                        <h3>
                            ${escapeHTML(ticket.title)}
                        </h3>

                        <p>
                            ${escapeHTML(
                                ticket.description ||
                                "No description provided."
                            )}
                        </p>

                    </div>

                </div>

                <div class="ticket-right">

                    <div class="ticket-meta">

                        <span class="priority-badge ${getPriorityClass(ticket.priority)}">
                            ${escapeHTML(ticket.priority)}
                        </span>

                        <span class="status-badge ${getStatusClass(ticket.status)}">
                            ${escapeHTML(ticket.status)}
                        </span>

                    </div>

                    <div class="ticket-buttons">
                        ${actionButtons}
                    </div>

                </div>

            </div>
        `;

    }).join("");
}

// =========================
// UPDATE STATISTICS
// =========================

function updateStatistics(tickets) {

    document.getElementById("totalTickets").textContent =
        tickets.length;

    document.getElementById("openTickets").textContent =
        tickets.filter(
            ticket => ticket.status === "OPEN"
        ).length;

    document.getElementById("inProgressTickets").textContent =
        tickets.filter(
            ticket => ticket.status === "IN PROGRESS"
        ).length;

    document.getElementById("criticalTickets").textContent =
        tickets.filter(
            ticket => ticket.priority === "CRITICAL"
        ).length;
}

// =========================
// OPEN NEW TICKET MODAL
// =========================

addTicketBtn.addEventListener("click", () => {

    editingTicketId = null;

    ticketForm.reset();

    document.querySelector(
        ".modal-header h2"
    ).textContent = "Create New Ticket";

    ticketForm.querySelector(
        'button[type="submit"]'
    ).textContent = "Create Ticket";

    ticketModal.classList.add("show");
});

// =========================
// EDIT TICKET
// =========================

function editTicket(id) {

    const ticket = allTickets.find(
        ticket => ticket.id === id
    );

    if (!ticket) {
        return;
    }

    /*
     * Safety check:
     * Resolved tickets should never be edited.
     */

    if (ticket.status === "RESOLVED") {
        return;
    }

    editingTicketId = id;

    document.getElementById(
        "ticketTitle"
    ).value = ticket.title || "";

    document.getElementById(
        "ticketDescription"
    ).value = ticket.description || "";

    document.getElementById(
        "ticketPriority"
    ).value = ticket.priority || "NORMAL";

    document.getElementById(
        "ticketStatus"
    ).value = ticket.status || "OPEN";

    document.querySelector(
        ".modal-header h2"
    ).textContent = `Edit Ticket #${id}`;

    ticketForm.querySelector(
        'button[type="submit"]'
    ).textContent = "Update Ticket";

    ticketModal.classList.add("show");
}

// =========================
// CLOSE MODAL
// =========================

function closeModal() {

    ticketModal.classList.remove("show");

    ticketForm.reset();

    editingTicketId = null;

    document.querySelector(
        ".modal-header h2"
    ).textContent = "Create New Ticket";

    ticketForm.querySelector(
        'button[type="submit"]'
    ).textContent = "Create Ticket";
}

closeModalBtn.addEventListener(
    "click",
    closeModal
);

cancelTicketBtn.addEventListener(
    "click",
    closeModal
);

ticketModal.addEventListener(
    "click",
    event => {

        if (event.target === ticketModal) {
            closeModal();
        }

    }
);

// =========================
// CREATE OR UPDATE TICKET
// =========================

ticketForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const title =
            document.getElementById(
                "ticketTitle"
            ).value.trim();

        const description =
            document.getElementById(
                "ticketDescription"
            ).value.trim();

        const priority =
            document.getElementById(
                "ticketPriority"
            ).value;

        const status =
            document.getElementById(
                "ticketStatus"
            ).value;

        if (!title || !description) {

            alert(
                "Please fill in all required fields."
            );

            return;
        }

        const submitButton =
            ticketForm.querySelector(
                'button[type="submit"]'
            );

        submitButton.disabled = true;

        submitButton.textContent =
            editingTicketId
                ? "Updating..."
                : "Creating...";

        try {

            const url = editingTicketId
                ? `${API_URL}/tickets/${editingTicketId}`
                : `${API_URL}/tickets`;

            const method = editingTicketId
                ? "PUT"
                : "POST";

            const response = await fetch(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        title,
                        description,
                        priority,
                        status
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    `API Error: ${response.status}`
                );
            }

            alert(
                editingTicketId
                    ? "Ticket updated successfully."
                    : "Ticket created successfully."
            );

            closeModal();

            await loadTickets();

        } catch (error) {

            console.error(
                "Ticket operation failed:",
                error
            );

            alert(
                `Operation failed: ${error.message}`
            );

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "Create Ticket";
        }
    }
);

// =========================
// DELETE TICKET
// =========================

async function deleteTicket(id) {

    const confirmed = confirm(
        `Are you sure you want to delete Ticket #${id}?`
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/tickets/${id}`,
            {
                method: "DELETE"
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                `API Error: ${response.status}`
            );
        }

        alert(
            `Ticket #${id} deleted successfully.`
        );

        await loadTickets();

    } catch (error) {

        console.error(
            "Failed to delete ticket:",
            error
        );

        alert(
            `Failed to delete ticket: ${error.message}`
        );
    }
}

// =========================
// FILTER
// =========================

statusFilter.addEventListener(
    "change",
    () => displayTickets(allTickets)
);

// =========================
// REFRESH
// =========================

refreshBtn.addEventListener(
    "click",
    loadTickets
);

// =========================
// PRIORITY CLASS
// =========================

function getPriorityClass(priority) {

    switch (priority) {

        case "CRITICAL":
            return "priority-critical";

        case "HIGH":
            return "priority-high";

        case "NORMAL":
            return "priority-normal";

        case "LOW":
            return "priority-low";

        default:
            return "";
    }
}

// =========================
// STATUS CLASS
// =========================

function getStatusClass(status) {

    switch (status) {

        case "OPEN":
            return "status-open";

        case "IN PROGRESS":
            return "status-progress";

        case "RESOLVED":
            return "status-resolved";

        default:
            return "";
    }
}

// =========================
// HTML SECURITY
// =========================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}

// =========================
// INITIAL LOAD
// =========================

loadTickets();