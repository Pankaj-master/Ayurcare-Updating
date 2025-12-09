<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ayurvedic Diet Management System - README</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        /* GitHub-like Font Stack */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
            background-color: #0d1117; /* GitHub Dark Dimmed */
            color: #c9d1d9;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 10px;
        }
        ::-webkit-scrollbar-track {
            background: #0d1117;
        }
        ::-webkit-scrollbar-thumb {
            background: #30363d;
            border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #484f58;
        }

        /* Markdown Container Simulation */
        .readme-container {
            max-width: 980px;
            margin: 40px auto;
            border: 1px solid #30363d;
            border-radius: 6px;
            background-color: #0d1117;
            padding: 32px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }

        /* Animated Divider */
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #30363d, transparent);
            margin: 40px 0;
        }

        /* Headers */
        h1, h2, h3 {
            border-bottom: 1px solid #21262d;
            padding-bottom: 0.3em;
            margin-bottom: 16px;
            font-weight: 600;
        }
        h1 { font-size: 2em; border-bottom: none; }
        h2 { font-size: 1.5em; margin-top: 24px; }
        h3 { font-size: 1.25em; border-bottom: none; }

        /* Links */
        a { color: #58a6ff; text-decoration: none; }
        a:hover { text-decoration: underline; }

        /* Code Blocks */
        pre {
            background-color: #161b22;
            border-radius: 6px;
            padding: 16px;
            overflow-x: auto;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
            font-size: 85%;
            line-height: 1.45;
            border: 1px solid #30363d;
            position: relative;
        }
        
        /* Copy Button */
        .copy-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: transparent;
            border: 1px solid #30363d;
            border-radius: 6px;
            color: #8b949e;
            padding: 3px 8px;
            font-size: 12px;
            cursor: pointer;
            transition: 0.2s;
        }
        .copy-btn:hover {
            background: #21262d;
            color: #c9d1d9;
        }

        /* Badges */
        .badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-right: 8px;
            margin-bottom: 8px;
            transition: transform 0.2s;
            cursor: default;
        }
        .badge:hover { transform: translateY(-2px); }
        .badge-green { background: rgba(35, 134, 54, 0.2); color: #3fb950; border: 1px solid rgba(35, 134, 54, 0.4); }
        .badge-blue { background: rgba(56, 139, 253, 0.15); color: #58a6ff; border: 1px solid rgba(56, 139, 253, 0.4); }
        .badge-orange { background: rgba(210, 153, 34, 0.15); color: #d29922; border: 1px solid rgba(210, 153, 34, 0.4); }
        .badge-purple { background: rgba(137, 87, 229, 0.15); color: #a371f7; border: 1px solid rgba(137, 87, 229, 0.4); }

        /* Animation: Pulse */
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 10px rgba(88, 166, 255, 0.1); }
            50% { box-shadow: 0 0 20px rgba(88, 166, 255, 0.3); }
        }

        /* Animation: Float */
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0px); }
        }

        /* SVG Data Flow Animation */
        .flow-path {
            stroke-dasharray: 10;
            animation: dash 1s linear infinite;
        }
        @keyframes dash {
            to { stroke-dashoffset: -20; }
        }

        /* Feature Cards */
        .feature-card {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 16px;
            transition: all 0.3s ease;
        }
        .feature-card:hover {
            border-color: #58a6ff;
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        /* Tree Structure */
        .tree-line {
            font-family: monospace;
            color: #8b949e;
            line-height: 1.6;
        }
        .tree-line:hover { color: #c9d1d9; }
    </style>
</head>
<body>

<div class="readme-container fade-in">
    
    <!-- Hero Section -->
    <div class="text-center mb-8">
        <div class="inline-block p-4 rounded-full bg-green-900/30 mb-4 animate-[bounce_2s_infinite]">
            <i class="fas fa-leaf text-4xl text-green-400"></i>
        </div>
        <h1 class="text-4xl font-bold text-white border-none mb-2">Ayurvedic Diet Management System</h1>
        <p class="text-xl text-gray-400 mb-6">Bridging ancient wisdom with modern technology.</p>
        
        <div class="flex flex-wrap justify-center gap-2">
            <span class="badge badge-green"><i class="fas fa-check-circle mr-1"></i> License: MIT</span>
            <span class="badge badge-blue"><i class="fab fa-react mr-1"></i> React 18</span>
            <span class="badge badge-blue"><i class="fab fa-node-js mr-1"></i> Node.js</span>
            <span class="badge badge-orange"><i class="fas fa-database mr-1"></i> PostgreSQL</span>
            <span class="badge badge-purple"><i class="fab fa-python mr-1"></i> Python ML</span>
        </div>
    </div>

    <!-- Architecture Diagram (SVG) -->
    <div class="my-10 p-6 bg-[#010409] rounded-lg border border-[#30363d] relative overflow-hidden group">
        <h3 class="text-center mb-6 text-gray-300">System Architecture</h3>
        
        <svg viewBox="0 0 800 200" class="w-full h-auto drop-shadow-lg">
            <!-- Defs for gradients/filters -->
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            <!-- Connections (Background Lines) -->
            <path d="M150 100 L350 100" stroke="#30363d" stroke-width="2" />
            <path d="M450 100 L650 100" stroke="#30363d" stroke-width="2" />

            <!-- Animated Data Flow (Frontend to Backend) -->
            <path d="M150 100 L350 100" stroke="#58a6ff" stroke-width="2" class="flow-path opacity-50" />
            
            <!-- Animated Data Flow (Backend to DB) -->
            <path d="M450 100 L650 100" stroke="#3fb950" stroke-width="2" class="flow-path opacity-50" style="animation-direction: reverse;" />

            <!-- Frontend Node -->
            <g transform="translate(50, 50)" class="cursor-pointer hover:opacity-80 transition-opacity">
                <rect x="0" y="0" width="100" height="100" rx="10" fill="#0d1117" stroke="#58a6ff" stroke-width="2" />
                <text x="50" y="85" text-anchor="middle" fill="#58a6ff" font-family="sans-serif" font-weight="bold" font-size="12">Frontend</text>
                <!-- Icon: Laptop -->
                <path d="M25 40 H75 V60 H25 Z M20 60 H80 L85 70 H15 L20 60" fill="#c9d1d9"/>
            </g>

            <!-- Backend Node -->
            <g transform="translate(350, 50)" class="cursor-pointer hover:opacity-80 transition-opacity">
                <rect x="0" y="0" width="100" height="100" rx="10" fill="#0d1117" stroke="#d29922" stroke-width="2" />
                <text x="50" y="85" text-anchor="middle" fill="#d29922" font-family="sans-serif" font-weight="bold" font-size="12">Backend API</text>
                <!-- Icon: Server -->
                <rect x="30" y="30" width="40" height="10" rx="2" fill="#c9d1d9"/>
                <rect x="30" y="45" width="40" height="10" rx="2" fill="#c9d1d9"/>
                <rect x="30" y="60" width="40" height="10" rx="2" fill="#c9d1d9"/>
                <!-- Status Lights -->
                <circle cx="65" cy="35" r="2" fill="#3fb950" class="animate-pulse"/>
                <circle cx="65" cy="50" r="2" fill="#3fb950" class="animate-pulse" style="animation-delay: 0.3s"/>
            </g>

            <!-- Database Node -->
            <g transform="translate(650, 50)" class="cursor-pointer hover:opacity-80 transition-opacity">
                <rect x="0" y="0" width="100" height="100" rx="10" fill="#0d1117" stroke="#3fb950" stroke-width="2" />
                <text x="50" y="85" text-anchor="middle" fill="#3fb950" font-family="sans-serif" font-weight="bold" font-size="12">PostgreSQL</text>
                <!-- Icon: DB -->
                <path d="M30 40 Q50 30 70 40 Q50 50 30 40 V70 Q50 80 70 70 V40" stroke="#c9d1d9" fill="none" stroke-width="2"/>
                <path d="M30 55 Q50 65 70 55" stroke="#c9d1d9" fill="none" stroke-width="2"/>
            </g>
        </svg>
    </div>

    <!-- Description -->
    <p class="mb-8 leading-relaxed">
        A comprehensive full-stack application for managing Ayurvedic diet plans. It allows doctors to create personalized plans based on Dosha types (Vata, Pitta, Kapha) and enables patients to track their progress, view recipes, and communicate with their health providers.
    </p>

    <div class="divider"></div>

    <!-- Features Grid -->
    <h2 class="flex items-center"><i class="fas fa-rocket mr-3 text-blue-400"></i> Key Features</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <!-- Doctors Column -->
        <div class="space-y-4">
            <h3 class="text-blue-400 text-sm uppercase tracking-wider font-bold mb-4">For Doctors</h3>
            
            <div class="feature-card">
                <div class="flex items-start">
                    <div class="bg-blue-900/30 p-2 rounded mr-4 text-blue-400"><i class="fas fa-user-md"></i></div>
                    <div>
                        <h4 class="font-bold text-gray-200">Patient Management</h4>
                        <p class="text-sm text-gray-400 mt-1">Add, view, and manage comprehensive patient records and history.</p>
                    </div>
                </div>
            </div>

            <div class="feature-card">
                <div class="flex items-start">
                    <div class="bg-blue-900/30 p-2 rounded mr-4 text-blue-400"><i class="fas fa-utensils"></i></div>
                    <div>
                        <h4 class="font-bold text-gray-200">Diet Creator</h4>
                        <p class="text-sm text-gray-400 mt-1">Create specific Ayurvedic plans based on Dosha analysis.</p>
                    </div>
                </div>
            </div>

            <div class="feature-card">
                <div class="flex items-start">
                    <div class="bg-blue-900/30 p-2 rounded mr-4 text-blue-400"><i class="fas fa-magic"></i></div>
                    <div>
                        <h4 class="font-bold text-gray-200">AI Diet Generation</h4>
                        <p class="text-sm text-gray-400 mt-1">Auto-generate meal suggestions based on patient profiles using Python-based ML models.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Patients Column -->
        <div class="space-y-4">
            <h3 class="text-green-400 text-sm uppercase tracking-wider font-bold mb-4">For Patients</h3>
            
            <div class="feature-card">
                <div class="flex items-start">
                    <div class="bg-green-900/30 p-2 rounded mr-4 text-green-400"><i class="fas fa-history"></i></div>
                    <div>
                        <h4 class="font-bold text-gray-200">Diet History</h4>
                        <p class="text-sm text-gray-400 mt-1">Track daily adherence and view historical diet plans.</p>
                    </div>
                </div>
            </div>

            <div class="feature-card">
                <div class="flex items-start">
                    <div class="bg-green-900/30 p-2 rounded mr-4 text-green-400"><i class="fas fa-comments"></i></div>
                    <div>
                        <h4 class="font-bold text-gray-200">Secure Chat</h4>
                        <p class="text-sm text-gray-400 mt-1">Direct, encrypted communication channel with your assigned doctor.</p>
                    </div>
                </div>
            </div>

            <div class="feature-card">
                <div class="flex items-start">
                    <div class="bg-green-900/30 p-2 rounded mr-4 text-green-400"><i class="fas fa-bell"></i></div>
                    <div>
                        <h4 class="font-bold text-gray-200">Smart Reminders</h4>
                        <p class="text-sm text-gray-400 mt-1">Notifications for meals, water intake, and medication.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="divider"></div>

    <!-- Tech Stack -->
    <h2 class="flex items-center"><i class="fas fa-layer-group mr-3 text-purple-400"></i> Tech Stack</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <h4 class="text-sm font-bold text-gray-400 mb-3 border-b border-[#30363d] pb-2">Frontend & Backend</h4>
            <ul class="space-y-2 text-sm">
                <li class="flex items-center"><i class="fab fa-react w-6 text-blue-400"></i> React 18 + TS</li>
                <li class="flex items-center"><i class="fas fa-wind w-6 text-teal-400"></i> TailwindCSS</li>
                <li class="flex items-center"><i class="fab fa-node w-6 text-green-500"></i> Node.js + Express</li>
                <li class="flex items-center"><i class="fas fa-database w-6 text-blue-300"></i> Prisma ORM</li>
            </ul>
        </div>

        <div class="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <h4 class="text-sm font-bold text-gray-400 mb-3 border-b border-[#30363d] pb-2">Machine Learning</h4>
            <ul class="space-y-2 text-sm">
                <li class="flex items-center"><i class="fab fa-python w-6 text-yellow-300"></i> Python 3.9+</li>
                <li class="flex items-center"><i class="fas fa-server w-6 text-green-400"></i> FastAPI / Uvicorn</li>
                <li class="flex items-center"><i class="fas fa-brain w-6 text-purple-400"></i> Scikit-Learn</li>
            </ul>
        </div>

        <div class="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <h4 class="text-sm font-bold text-gray-400 mb-3 border-b border-[#30363d] pb-2">Data & Security</h4>
            <ul class="space-y-2 text-sm">
                <li class="flex items-center"><i class="fas fa-server w-6 text-blue-400"></i> PostgreSQL 15+</li>
                <li class="flex items-center"><i class="fas fa-key w-6 text-yellow-500"></i> JWT Auth</li>
                <li class="flex items-center"><i class="fas fa-lock w-6 text-red-400"></i> BCrypt</li>
            </ul>
        </div>
    </div>

    <!-- File Structure (Visual) -->
    <h2 class="flex items-center"><i class="fas fa-folder-open mr-3 text-yellow-400"></i> Project Structure</h2>
    <div class="bg-[#161b22] border border-[#30363d] rounded-lg p-4 mb-10 overflow-hidden relative">
        <div class="absolute top-0 right-0 p-4 opacity-10">
            <i class="fas fa-code text-6xl"></i>
        </div>
        <div class="font-mono text-sm">
            <div class="tree-line"><span class="text-blue-400">ayurvedic-diet-management/</span></div>
            <div class="tree-line pl-4">├── <span class="text-yellow-400">UI/</span> <span class="text-gray-500">// Frontend React App</span></div>
            <div class="tree-line pl-4">├── <span class="text-yellow-400">backend/</span> <span class="text-gray-500">// Express API</span></div>
            <div class="tree-line pl-4">├── <span class="text-purple-400">Models/</span> <span class="text-gray-500">// Machine Learning Service</span></div>
            <div class="tree-line pl-8">├── main.py</div>
            <div class="tree-line pl-8">└── requirements.txt</div>
            <div class="tree-line pl-4">└── <span class="text-gray-300">README.md</span></div>
        </div>
    </div>

    <!-- Quick Start -->
    <h2 class="flex items-center"><i class="fas fa-play-circle mr-3 text-green-400"></i> Quick Start</h2>
    <p class="mb-4">Follow these steps to set up the environment manually.</p>

    <div class="space-y-4">
        <div>
            <p class="text-sm font-bold text-gray-400 mb-2">1. Clone the repository</p>
            <pre><button class="copy-btn" onclick="copyCode(this)">Copy</button><code class="language-bash">git clone https://github.com/username/ayurvedic-diet-management.git
cd ayurvedic-diet-management</code></pre>
        </div>

        <div>
            <p class="text-sm font-bold text-gray-400 mb-2">2. Backend Setup (Node.js)</p>
            <pre><button class="copy-btn" onclick="copyCode(this)">Copy</button><code class="language-bash">cd backend
npm install
npm run dev</code></pre>
        </div>

        <div>
            <p class="text-sm font-bold text-gray-400 mb-2">3. Frontend Setup (React)</p>
            <pre><button class="copy-btn" onclick="copyCode(this)">Copy</button><code class="language-bash">cd ../UI
npm install
npm run dev</code></pre>
        </div>

        <div>
            <p class="text-sm font-bold text-gray-400 mb-2">4. Machine Learning Service (Python)</p>
            <div class="bg-purple-900/10 border border-purple-500/30 rounded p-3 mb-2 text-xs text-purple-200">
                <i class="fas fa-info-circle mr-1"></i> Ensure you have Python installed and are in the root directory before running this.
            </div>
            <pre><button class="copy-btn" onclick="copyCode(this)">Copy</button><code class="language-bash">cd ../Models
pip install -r requirements.txt
uvicorn main:app --reload --port 8000</code></pre>
        </div>
    </div>

    <div class="mt-12 text-center text-sm text-gray-500 border-t border-[#30363d] pt-8">
        <p>Built with ❤️ using Ayurvedic principles.</p>
        <div class="mt-2 space-x-4">
            <a href="#" class="hover:text-blue-400"><i class="fab fa-github"></i> Repository</a>
            <a href="#" class="hover:text-blue-400"><i class="fas fa-bug"></i> Report Issue</a>
        </div>
    </div>

</div>

<script>
    // Copy to clipboard functionality
    function copyCode(btn) {
        const pre = btn.parentElement;
        const code = pre.querySelector('code');
        const text = code.innerText;

        // Use clipboard API
        // Fallback for iframe environments if navigator.clipboard is restricted
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            const originalText = btn.innerText;
            btn.innerText = 'Copied!';
            btn.style.color = '#3fb950';
            btn.style.borderColor = '#3fb950';
            
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.color = '';
                btn.style.borderColor = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
        document.body.removeChild(textArea);
    }
</script>

</body>
</html>