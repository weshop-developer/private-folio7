import { useState, useEffect } from 'react';

// Simplified Crypto Logic
async function deriveKey(password: string, salt: Uint8Array) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

function App() {
    const [prices, setPrices] = useState<any>(null);

    useEffect(() => {
        fetch('/api/prices?ids=bitcoin,ethereum')
            .then(res => res.json())
            .then(data => setPrices(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
                <h1 className="text-3xl font-bold mb-4">PrivateFolio (Hono + React)</h1>

                <div className="mb-6 p-4 bg-blue-50 rounded text-sm text-blue-800">
                    This app runs on <strong>Cloudflare Workers</strong> using Hono for API and Vite for UI.
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Live Prices (from Proxy API)</h2>
                    {prices ? (
                        <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto">
                            {JSON.stringify(prices, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-gray-500">Loading prices...</p>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Local Encryption</h2>
                    <p className="text-gray-600 text-sm">Encryption logic will be ported here next.</p>
                </div>
            </div>
        </div>
    );
}

export default App;
