
  document.addEventListener('DOMContentLoaded', async function() {
      
      connectWebSockets()
      await loadVotersTable();
      await loadCandidatesTable();
  });

  async function loadVotersTable() {
    const votersTable = document.querySelector('#voters table') as HTMLTableSectionElement;
    votersTable.innerHTML = '';
    
    const voterSelect = document.getElementById('voterSelect') as HTMLSelectElement;
    while (voterSelect.options.length > 0) {
      voterSelect.remove(0); // Remove each option from the dropdown
    }

    await fetch('https://localhost:7027/Voters')
        .then(response => response.json())
        .then(data => {
            data.forEach((voter: { id: string, name: string ; hasVoted: boolean; }) => {
            const row = votersTable?.insertRow();
            row.insertCell().textContent = voter.name;
            row.insertCell().textContent = voter.hasVoted ? '✔️' : '❌';

            const option = document.createElement('option');
            option.value = voter.id;
            option.textContent = voter.name;
            voterSelect.appendChild(option);
      });
    });
  }

  async function loadCandidatesTable() {
    const candidatesTable = document.querySelector('#candidates table') as HTMLTableSectionElement;
    candidatesTable.innerHTML = '';
    const candidateSelect = document.getElementById('candidateSelect') as HTMLSelectElement
    while (candidateSelect.options.length > 0) {
      candidateSelect.remove(0); // Remove each option from the dropdown
    }

    await fetch('https://localhost:7027/Candidates').then(response => response.json()).then(data => {
      data.forEach((candidate: { id: string, name: string; votes: Number; }) => {
        const row = candidatesTable.insertRow();
        row.insertCell().textContent = candidate.name;
        row.insertCell().textContent = candidate.votes.toString();
  
        const option = document.createElement('option');
        option.value = candidate.id;
        option.textContent = candidate.name;
        candidateSelect.appendChild(option);
      });
    });
  }

  async function addVoter() {
    const newVoterName = document.getElementById('newVoterName') as HTMLInputElement;
    const voterName = newVoterName.value.trim();
    if (voterName) {
      const newVoterName = document.getElementById('newVoterName') as HTMLInputElement;
      const candidateName = newVoterName.value.trim();

      await fetch('https://localhost:7027/Voters/voter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: candidateName })
      })

      newVoterName.value = '';
    }
  }
  
  async function addCandidate() {
    const newCandidateName = document.getElementById('newCandidateName') as HTMLInputElement;
    const candidateName = newCandidateName.value.trim();
    if (candidateName) {

      const newCandidateName = document.getElementById('newCandidateName') as HTMLInputElement;
      const candidateName = newCandidateName.value.trim();

      await fetch('https://localhost:7027/Candidates/candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: candidateName })
      })

      newCandidateName.value = '';
    }
  }
  
  async function submitVote() {
    const voterSelect = document.getElementById('voterSelect') as HTMLSelectElement;
    const candidateSelect = document.getElementById('candidateSelect') as HTMLSelectElement

    const voter = voterSelect.value;
    const candidate = candidateSelect.value;
  
    await fetch('https://localhost:7027/Votes/voting/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ voterId: voter, candidateId: candidate })
    });
  }

  function connectWebSockets(){
     const socket = new WebSocket("wss://localhost:7027/ws")
     socket.onopen = function() {
        console.log("Connected to websockets")
     }

     socket.onmessage = function (event) {
        if (event) {
          console.log(`Received message: ${event.data}`);
          const message = JSON.parse(event.data) as { MessageType: string };

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
              console.log("Unkown message received")
              break;
          }          
        }  
     }
}
