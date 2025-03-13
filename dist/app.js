// This is a placeholder for the compiled TypeScript code.
// In a real implementation, you would run 'npm install' and 'npm run build' to compile the TypeScript code.

console.log("Script loaded");

// Agent definitions
const agents = {
    assistant: {
        name: "Assistant",
        instructions: "You are a helpful assistant."
    },
    mathTutor: {
        name: "Math Tutor",
        instructions: "You provide help with math problems. Explain your reasoning at each step and include examples.",
        handoffDescriptions: {
            historyTutor: "Specialist agent for historical questions"
        }
    },
    historyTutor: {
        name: "History Tutor",
        instructions: "You provide assistance with historical queries. Explain important events and context.",
        handoffDescriptions: {
            mathTutor: "Specialist agent for math questions"
        }
    },
    triage: {
        name: "Triage Agent",
        instructions: "You determine which agent to use based on the user's question.",
        handoffDescriptions: {
            mathTutor: "Specialist agent for math questions",
            historyTutor: "Specialist agent for historical questions"
        }
    }
};

// Tool definitions
const tools = {
    webSearch: {
        name: "web_search",
        description: "Search the web for information",
        execute: async (query) => {
            // In a real implementation, this would call an actual search API
            console.log(`Searching the web for: ${query}`);
            return `Search results for "${query}" would appear here.`;
        }
    },
    calculator: {
        name: "calculator",
        description: "Perform calculations",
        execute: async (expression) => {
            try {
                // Simple evaluation - in a real implementation, you'd use a safer method
                const result = eval(expression);
                return `Result: ${result}`;
            } catch (error) {
                return `Error calculating: ${error}`;
            }
        }
    },
    weatherInfo: {
        name: "weather_info",
        description: "Get weather information for a location",
        execute: async (location) => {
            // In a real implementation, this would call a weather API
            console.log(`Getting weather for: ${location}`);
            return `Weather information for "${location}" would appear here.`;
        }
    }
};

// DOM Elements
let chatMessages;
let userInput;
let sendButton;
let toolsList;
let agentButtons;

// Current state
let currentAgent = 'assistant';
let messages = [];

// Initialize the application
function init() {
    console.log("Initializing application");
    
    // Get DOM elements
    chatMessages = document.getElementById('chat-messages');
    userInput = document.getElementById('user-input');
    sendButton = document.getElementById('send-btn');
    toolsList = document.getElementById('tools-list');
    agentButtons = document.querySelectorAll('.agent-btn');
    
    console.log("Chat messages element:", chatMessages);
    console.log("User input element:", userInput);
    console.log("Send button element:", sendButton);
    console.log("Tools list element:", toolsList);
    console.log("Agent buttons:", agentButtons.length);

    // Add event listeners
    if (sendButton) {
        sendButton.addEventListener('click', function() {
            console.log("Send button clicked");
            handleSendMessage();
        });
    } else {
        console.error("Send button not found");
    }
    
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            console.log("Key pressed in input:", e.key);
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
        
        // Add input event listener to track changes
        userInput.addEventListener('input', function(e) {
            console.log("Input value changed:", userInput.value);
        });
    } else {
        console.error("User input not found");
    }

    // Add event listeners to agent buttons
    agentButtons.forEach(button => {
        console.log("Adding click listener to button:", button.textContent);
        button.addEventListener('click', function() {
            const agentType = this.getAttribute('data-agent');
            console.log("Agent button clicked:", agentType);
            if (agentType) {
                setCurrentAgent(agentType);
            }
        });
    });

    // Set initial agent
    setCurrentAgent('assistant');
    
    // Add a test message
    addMessage({
        role: 'system',
        content: 'Welcome to the OpenAI Agents Demo. Select an agent and start chatting!'
    });
}

// Set the current agent
function setCurrentAgent(agentType) {
    console.log("Setting current agent:", agentType);
    
    // Convert from kebab-case to camelCase if needed
    const agentKey = agentType.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    console.log("Agent key:", agentKey);
    
    if (agents[agentKey]) {
        currentAgent = agentKey;
        
        // Update UI
        agentButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-agent') === agentType) {
                button.classList.add('active');
            }
        });

        // Update tools list
        updateToolsList();

        // Add system message
        addMessage({
            role: 'system',
            content: `Switched to ${agents[agentKey].name} agent.`
        });
    } else {
        console.error("Agent not found:", agentKey);
    }
}

// Update the tools list based on the current agent
function updateToolsList() {
    console.log("Updating tools list for agent:", currentAgent);
    
    toolsList.innerHTML = '';
    
    // Get tools for the current agent
    const agentTools = agents[currentAgent].tools || [];
    
    if (agentTools.length === 0) {
        // If no specific tools, show some default tools
        const defaultTools = [tools.webSearch];
        defaultTools.forEach(tool => {
            addToolToList(tool);
        });
    } else {
        // Show agent-specific tools
        agentTools.forEach(tool => {
            addToolToList(tool);
        });
    }

    // Show handoff options if available
    const handoffs = agents[currentAgent].handoffDescriptions;
    if (handoffs) {
        Object.entries(handoffs).forEach(([agentKey, description]) => {
            const handoffTool = {
                name: `handoff_to_${agentKey}`,
                description: description,
                execute: async () => `Handoff to ${agents[agentKey].name}`
            };
            addToolToList(handoffTool);
        });
    }
}

// Add a tool to the tools list
function addToolToList(tool) {
    console.log("Adding tool to list:", tool.name);
    
    const toolElement = document.createElement('div');
    toolElement.className = 'tool-item';
    toolElement.innerHTML = `
        <h3>${tool.name}</h3>
        <p>${tool.description}</p>
    `;
    toolsList.appendChild(toolElement);
}

// Handle sending a message
function handleSendMessage() {
    // Get the input value directly from the DOM again
    const inputElement = document.getElementById('user-input');
    if (!inputElement) {
        console.error("User input element not found when trying to send message");
        return;
    }
    
    const message = inputElement.value.trim();
    console.log("Handling send message:", message);
    
    if (message) {
        // Add user message
        addMessage({
            role: 'user',
            content: message
        });

        // Clear input
        inputElement.value = '';

        // Process message (in a real implementation, this would call the OpenAI API)
        processMessage(message);
    } else {
        console.log("No message to send");
    }
}

// Process a message using the current agent
function processMessage(message) {
    // In a real implementation, this would call the OpenAI API with the agent configuration
    console.log(`Processing message with ${agents[currentAgent].name} agent: ${message}`);

    // Generate a response based on the agent type
    let response = '';
    
    switch (currentAgent) {
        case 'mathTutor':
            if (message.toLowerCase().includes('history')) {
                response = "I'm specialized in math. Would you like me to hand off to the History Tutor?";
            } else {
                response = `I'll help you solve this math problem: ${message}\n\nLet's break it down step by step...`;
            }
            break;
        case 'historyTutor':
            if (message.toLowerCase().includes('math') || message.toLowerCase().includes('calculate')) {
                response = "I'm specialized in history. Would you like me to hand off to the Math Tutor?";
            } else {
                response = `Here's some historical context about: ${message}\n\nIn examining this historical question...`;
            }
            break;
        case 'triage':
            if (message.toLowerCase().includes('math') || message.toLowerCase().includes('calculate')) {
                response = "This seems like a math question. I'll hand off to the Math Tutor.";
                // In a real implementation, this would actually hand off to the math tutor
                setTimeout(() => setCurrentAgent('mathTutor'), 1500);
            } else if (message.toLowerCase().includes('history') || message.toLowerCase().includes('war') || message.toLowerCase().includes('president')) {
                response = "This seems like a history question. I'll hand off to the History Tutor.";
                // In a real implementation, this would actually hand off to the history tutor
                setTimeout(() => setCurrentAgent('historyTutor'), 1500);
            } else {
                response = "I'm not sure which specialist would be best for this. Could you provide more details?";
            }
            break;
        default:
            response = `I'm here to help with your question about: ${message}`;
            break;
    }

    console.log("Agent response:", response);

    // Add agent response after a short delay to simulate processing
    setTimeout(() => {
        addMessage({
            role: 'agent',
            content: response
        });
    }, 1000);
}

// Add a message to the chat
function addMessage(message) {
    console.log("Adding message:", message);
    
    messages.push(message);
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.role}`;
    messageElement.innerHTML = `<p>${message.content}</p>`;
    
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add a simple function to add a test message
function addTestMessage(content) {
    console.log("Adding test message:", content);
    
    // Add user message
    addMessage({
        role: 'user',
        content: content
    });

    // Process message
    processMessage(content);
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
console.log("Event listener added for DOMContentLoaded");

// Add a direct click handler to each agent button after the page loads
window.onload = function() {
    console.log("Window loaded, adding direct click handlers to agent buttons");
    
    // Get all agent buttons
    const buttons = document.querySelectorAll('.agent-btn');
    
    // Add click handlers
    buttons.forEach(button => {
        console.log("Adding direct click handler to button:", button.textContent);
        button.onclick = function() {
            const agentType = this.getAttribute('data-agent');
            console.log("Agent button clicked directly:", agentType);
            if (agentType) {
                setCurrentAgent(agentType);
            }
        };
    });
    
    // Add a global function for testing
    window.sendTestMessage = function(message) {
        console.log("Sending test message:", message);
        addTestMessage(message);
    };
};