document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chat-input-container');
    const input = document.getElementById('chat-input');
    const chatContainer = document.getElementById('chat-container');
    const submitButton = document.getElementById('chat-submit');

    // Function to send the message
// Function to send the message
const sendMessage = async () => {
    const userMessage = input.value.trim(); // Get user message and trim whitespace
    if (!userMessage) return; // Prevent sending empty messages

    // Display the user's message
    chatContainer.innerHTML += `<div class="message user-message">${userMessage}</div>`;
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to the bottom
    input.value = ''; // Clear input field

    // Retrieve the stored token
    const token = localStorage.getItem('token'); 
    if (!token) {
        alert('Please log in to access this feature.');
        return; // Stop further execution if no token
    }

    try {
        const response = await fetch('http://localhost:5001/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Attach the token to the request headers
            },
            body: JSON.stringify({ message: userMessage }),
        });

        // Check if the user is not logged in (assuming a 403 Forbidden status)
        if (response.status === 403) {
            chatContainer.innerHTML += `<div class="error">Access denied. Please log in.</div>`;
            return; // Stop further execution
        }

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // Process AI response to remove unwanted characters
        const aiResponse = data.response.replace(/[*#]/g, ''); // Remove '*' and '#' characters

        // Display AI response
        chatContainer.innerHTML += `<div class="message ai-response">${aiResponse}</div>`;
        chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to the bottom
    } catch (error) {
        console.error('Error:', error);
        chatContainer.innerHTML += `<div class="error">Error: ${error.message}</div>`;
    }
};



    // Prevent default form submission and handle sending message
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        sendMessage(); // Call the sendMessage function
    });

    // Send message on submit button click
    submitButton.addEventListener('click', sendMessage); // Call sendMessage when the button is clicked

    // Send message on pressing Enter key in the input field
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default action (e.g., newline in textarea)
            sendMessage(); // Call sendMessage when Enter is pressed
        }
    });
});

// Function to start a new conversation
function newConversation() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = ''; // Clear the chat container
    appendMessage('New conversation started!', 'ai-response');  // You can modify this as needed
}

// Function to clear the chat
function clearChat() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';  // Clears all messages in the chat
}


function logout() {
    // Clear session data (if applicable)
    sessionStorage.clear(); // or localStorage.clear(); based on your app's storage

    // Redirect to the logout route
    window.location.href = "/logout";
}
