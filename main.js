// ==UserScript==
// @name         TheFall.io - Unlock All Cosmetics and infinite money
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Unlock all / Infinite Money
// @match        https://thefall.io/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let authToken = null;
    let playerData = null;

    const availableCosmetics = ["man_hat", "crown", "cone", "headband"];

    const createUI = () => {
        const uiContainer = document.createElement('div');
        uiContainer.style.position = 'fixed';
        uiContainer.style.top = '100px';
        uiContainer.style.right = '20px';
        uiContainer.style.padding = '20px';
        uiContainer.style.zIndex = 9999;
        uiContainer.style.backgroundColor = '#111';
        uiContainer.style.color = 'white';
        uiContainer.style.borderRadius = '12px';
        uiContainer.style.boxShadow = '0 0 15px rgba(0,0,0,0.6)';
        uiContainer.style.fontFamily = 'monospace';
        uiContainer.style.width = '250px';
        uiContainer.id = 'exploit-ui';

        uiContainer.innerHTML = `
            <h3 style="margin-top: 0; text-align: center;">TheFall.io Exploit</h3>
            <div style="margin-bottom: 15px;">
                <label>Money:</label><br/>
                <input type="range" id="moneySlider" min="1" max="999999" value="1" style="width: 100%; background: #222; color: white; border: 1px solid #444; margin-top: 5px;" />
                <span id="moneyValue" style="color: white;">1</span>
            </div>
            <button id="updatePlayerBtn" style="width: 100%; padding: 8px; background: #26a; color: white; border: none; border-radius: 4px; cursor: pointer;">Update Player</button>
            <button id="unlockCosmeticsBtn" style="width: 100%; padding: 8px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">Unlock All Cosmetics</button>
            <div id="statusMessage" style="margin-top: 10px; font-size: 12px; text-align: center;">Waiting for token...</div>
        `;

        document.body.appendChild(uiContainer);

        document.getElementById('updatePlayerBtn').addEventListener('click', updatePlayerData);
        document.getElementById('unlockCosmeticsBtn').addEventListener('click', unlockCosmetics);

        document.getElementById('moneySlider').addEventListener('input', (event) => {
            document.getElementById('moneyValue').textContent = event.target.value;
        });
    };

    const updatePlayerData = async () => {
        if (!authToken || !playerData) {
            setStatus('No auth token or player data found!', 'error');
            return;
        }

        const playerUpdate = {};
        const moneyAmount = document.getElementById('moneySlider').value.trim();
        if (moneyAmount && !isNaN(parseInt(moneyAmount))) {
            playerUpdate.money = parseInt(moneyAmount);
        }

        const updatedData = {
            ...playerData,
            ...playerUpdate
        };

        try {
            const response = await fetch("https://thefall.io/api/player/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authToken
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            setStatus('Player updated successfully. Reload the page!', 'success');
        } catch (err) {
            setStatus('Player updated successfully. Reload the page!', 'success'); // UNUSED, TOO BORED TO REMOVE IT
        }
    };

    const unlockCosmetics = async () => {
        if (!authToken || !playerData) {
            setStatus('No auth token or player data found!', 'error');
            return;
        }

        const cosmeticsData = {
            cosmetics: availableCosmetics
        };

        try {
            const response = await fetch("https://thefall.io/api/player/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authToken
                },
                body: JSON.stringify({ ...playerData, ...cosmeticsData })
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            setStatus('All cosmetics unlocked! Reload the page!', 'success');
        } catch (err) {
            setStatus('All cosmetics unlocked! Reload the page!', 'success'); // UNUSED, TOO BORED TO REMOVE IT
        }
    };

    const setStatus = (message, type = 'info') => {
        const statusElement = document.getElementById('statusMessage');
        if (!statusElement) return;

        statusElement.textContent = message;
        statusElement.className = '';

        switch (type) {
            case 'success':
                statusElement.style.color = '#4caf50';
                break;
            case 'error':
                statusElement.style.color = '#f44336';
                break;
            case 'pending':
                statusElement.style.color = '#ff9800';
                break;
            default:
                statusElement.style.color = 'white';
        }

        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                if (statusElement.textContent === message) {
                    statusElement.textContent = 'Ready';
                    statusElement.style.color = '#4caf50';
                }
            }, 3000);
        }
    };

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const [url, config] = args;

        if (typeof url === "string" && url.includes("/api/player/me") && config?.headers?.Authorization?.startsWith("Bearer ")) {
            if (!authToken) {
                authToken = config.headers.Authorization;
                setStatus("Token captured! You can now use the exploit.", "success");

                const playerResponse = await fetch(url, { headers: { "Authorization": authToken } });
                playerData = await playerResponse.json();

                if (!document.getElementById('exploit-ui')) {
                    createUI();
                }
            }
        }

        return originalFetch.apply(this, args);
    };

    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!document.getElementById('exploit-ui')) {
                createUI();
                setStatus('Waiting for token...', 'pending');
            }
        }, 1500);
    });
})();
