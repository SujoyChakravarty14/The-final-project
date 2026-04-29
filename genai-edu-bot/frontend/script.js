const API_URL = "http://127.0.0.1:8000";

// Load question
async function loadQuestion() {
    try {
        const res = await fetch(API_URL + "/question");
        const data = await res.json();

        document.getElementById("question").innerText = data.body;
        document.getElementById("answer").value = "";
        document.getElementById("result").innerText = "No evaluation yet";

    } catch (err) {
        document.getElementById("question").innerText = "Error loading question";
        console.error(err);
    }
}

// Submit answer
async function submitAnswer() {
    const answer = document.getElementById("answer").value;

    if (!answer) {
        alert("Please write an answer first!");
        return;
    }

    try {
        document.getElementById("result").innerText = "Evaluating...";

        const res = await fetch(API_URL + "/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ answer })
        });

        const data = await res.json();

        if (!data.evaluation || data.evaluation.error) {
            document.getElementById("result").innerHTML =
                `<p class="error">${data.evaluation?.error || "Invalid response"}</p>`;
            return;
        }

        displayEvaluation(data.evaluation);
        loadHistory();

    } catch (err) {
        document.getElementById("result").innerHTML =
            "<p class='error'>Server error</p>";
        console.error(err);
    }
}

// Display evaluation
function displayEvaluation(evaluation) {
    let html = `<div class="score">Score: ${eval.score ?? "N/A"}/10</div>`;

    html += "<h4>Strengths</h4><ul>";
    (evaluation.strengths || []).forEach(s => html += `<li>${s}</li>`);
    html += "</ul>";

    html += "<h4>Weaknesses</h4><ul>";
    (evaluation.weaknesses || []).forEach(w => html += `<li>${w}</li>`);
    html += "</ul>";

    html += "<h4>Improved Answer</h4>";
    html += `<p>${evaluation.improved_answer || "N/A"}</p>`;

    document.getElementById("result").innerHTML = html;
}

// Load history
async function loadHistory() {
    try {
        const res = await fetch(API_URL + "/history");
        const data = await res.json();

        let html = "";

        data.slice().reverse().forEach(item => {
            html += `
            <div class="card">
                <strong>Q:</strong> ${item.question.body}<br>
                <strong>Your Answer:</strong> ${item.answer}<br>
                <strong>Score:</strong> ${item.evaluation.score ?? "N/A"}
            </div>`;
        });

        document.getElementById("history").innerHTML =
            html || "No history yet";

    } catch (err) {
        console.error(err);
    }
}

// Button bindings
document.getElementById("nextBtn").addEventListener("click", loadQuestion);
document.getElementById("submitBtn").addEventListener("click", submitAnswer);

// Initial load
loadQuestion();