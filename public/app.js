"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener('DOMContentLoaded', function () {
    return __awaiter(this, void 0, void 0, function* () {
        connectWebSockets();
        yield loadVotersTable();
        yield loadCandidatesTable();
    });
});
function loadVotersTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const votersTable = document.querySelector('#voters table');
        votersTable.innerHTML = '';
        const voterSelect = document.getElementById('voterSelect');
        while (voterSelect.options.length > 0) {
            voterSelect.remove(0); // Remove each option from the dropdown
        }
        yield fetch('https://localhost:7027/Voters')
            .then(response => response.json())
            .then(data => {
            data.forEach((voter) => {
                const row = votersTable === null || votersTable === void 0 ? void 0 : votersTable.insertRow();
                row.insertCell().textContent = voter.name;
                row.insertCell().textContent = voter.hasVoted ? '✔️' : '❌';
                const option = document.createElement('option');
                option.value = voter.id;
                option.textContent = voter.name;
                voterSelect.appendChild(option);
            });
        });
    });
}
function loadCandidatesTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const candidatesTable = document.querySelector('#candidates table');
        candidatesTable.innerHTML = '';
        const candidateSelect = document.getElementById('candidateSelect');
        while (candidateSelect.options.length > 0) {
            candidateSelect.remove(0); // Remove each option from the dropdown
        }
        yield fetch('https://localhost:7027/Candidates').then(response => response.json()).then(data => {
            data.forEach((candidate) => {
                const row = candidatesTable.insertRow();
                row.insertCell().textContent = candidate.name;
                row.insertCell().textContent = candidate.votes.toString();
                const option = document.createElement('option');
                option.value = candidate.id;
                option.textContent = candidate.name;
                candidateSelect.appendChild(option);
            });
        });
    });
}
function addVoter() {
    return __awaiter(this, void 0, void 0, function* () {
        const newVoterName = document.getElementById('newVoterName');
        const voterName = newVoterName.value.trim();
        if (voterName) {
            const newVoterName = document.getElementById('newVoterName');
            const candidateName = newVoterName.value.trim();
            yield fetch('https://localhost:7027/Voters/voter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: candidateName })
            });
            newVoterName.value = '';
        }
    });
}
function addCandidate() {
    return __awaiter(this, void 0, void 0, function* () {
        const newCandidateName = document.getElementById('newCandidateName');
        const candidateName = newCandidateName.value.trim();
        if (candidateName) {
            const newCandidateName = document.getElementById('newCandidateName');
            const candidateName = newCandidateName.value.trim();
            yield fetch('https://localhost:7027/Candidates/candidate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: candidateName })
            });
            newCandidateName.value = '';
        }
    });
}
function submitVote() {
    return __awaiter(this, void 0, void 0, function* () {
        const voterSelect = document.getElementById('voterSelect');
        const candidateSelect = document.getElementById('candidateSelect');
        const voter = voterSelect.value;
        const candidate = candidateSelect.value;
        yield fetch('https://localhost:7027/Votes/voting/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ voterId: voter, candidateId: candidate })
        });
    });
}
function connectWebSockets() {
    const socket = new WebSocket("wss://localhost:7027/ws");
    socket.onopen = function () {
        console.log("Connected to websockets");
    };
    socket.onmessage = function (event) {
        if (event) {
            console.log(`Received message: ${event.data}`);
            const message = JSON.parse(event.data);
            switch (message.MessageType) {
                case "RefreshVoters":
                    loadVotersTable();
                    break;
                case "RefreshCandidates":
                    loadCandidatesTable();
                    break;
                case "RefreshAll":
                    loadVotersTable();
                    loadCandidatesTable();
                default:
                    console.log("Unkown message received");
                    break;
            }
        }
    };
}
