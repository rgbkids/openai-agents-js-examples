// Types
interface Agent {
    name: string;
    instructions: string;
    tools?: Tool[];
    handoffDescriptions?: Record<string, string>;
}

interface Tool {
    name: string;
    description: string;
    execute: (args: any) => Promise<string>;
}

interface Message {
    role: 'user' | 'agent' | 'system';
    content: string;
}

// Agent definitions
const agents: Record<string, Agent> = {
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
const tools: Record<string, Tool> = {
    webSearch: {
        name: "web_search",
        description: "Search the web for information",
        execute: async (query: string) => {
            // In a real implementation, this would call an actual search API
            console.log(`Searching the web for: ${query}`);
            return `Search results for "${query}" would appear here.`;
        }
    },
    calculator: {
        name: "calculator",
        description: "Perform calculations",
        execute: async (expression: string) => {
            try {
                // Simple evaluation - in a real implementation, you'd use a safer method
                // eslint-disable-next-line no-eval
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
        execute: async (location: string) => {
            // In a real implementation, this would call a weather API
            console.log(`Getting weather for: ${location}`);
            return `Weather information for "${location}" would appear here.`;
        }
    }
};

// DOM Elements
let chatMessages: HTMLElement;
let userInput: HTMLInputElement;
let sendButton: HTMLElement;
let toolsList: HTMLElement;
let agentButtons: NodeListOf<Element>;

// Current state
let currentAgent: string = 'assistant';
let messages: Message[] = [];

// Initialize the application
function init() {
    // Get DOM elements
    chatMessages = document.getElementById('chat-messages') as HTMLElement;
    userInput = document.getElementById('user-input') as HTMLInputElement;
    sendButton = document.getElementById('send-btn') as HTMLElement;
    toolsList = document.getElementById('tools-list') as HTMLElement;
    agentButtons = document.querySelectorAll('.agent-btn');

    // Add event listeners
    sendButton.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    agentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const agentType = button.getAttribute('data-agent');
            if (agentType) {
                setCurrentAgent(agentType);
            }
        });
    });

    // Set initial agent
    setCurrentAgent('assistant');
}

// Set the current agent
function setCurrentAgent(agentType: string) {
    // Convert from kebab-case to camelCase if needed
    const agentKey = agentType.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    
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
    }
}

// Update the tools list based on the current agent
function updateToolsList() {
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
function addToolToList(tool: Tool) {
    const toolElement = document.createElement('div');
    toolElement.className = 'tool-item';
    toolElement.innerHTML = `
        <h3>${tool.name}</h3>
        <p>${tool.description}</p>
    `;
    toolsList.appendChild(toolElement);
}

// Handle sending a message
async function handleSendMessage() {
    const message = userInput.value.trim();
    if (message) {
        // Add user message
        addMessage({
            role: 'user',
            content: message
        });

        // Clear input
        userInput.value = '';

        // Process message (in a real implementation, this would call the OpenAI API)
        await processMessage(message);
    }
}

// Process a message using the current agent
async function processMessage(message: string) {
    // In a real implementation, this would call the OpenAI API with the agent configuration
    console.log(`Processing message with ${agents[currentAgent].name} agent: ${message}`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

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

    // Add agent response
    addMessage({
        role: 'agent',
        content: response
    });
}

// Add a message to the chat
function addMessage(message: Message) {
    messages.push(message);
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.role}`;
    messageElement.innerHTML = `<p>${message.content}</p>`;
    
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);