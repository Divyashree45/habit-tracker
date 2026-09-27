const habitForm = document.getElementById("habitForm");
const habitName = document.getElementById("habitName");
const habitFrequency = document.getElementById("habitFrequency");
const habitList = document.getElementById("habitList");
const emptyMessage = document.querySelector(".empty-message");

let habits = JSON.parse(localStorage.getItem("habits")) || [];

function saveHabits() {
    localStorage.setItem("habits", JSON.stringify(habits));
}

function getToday() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getDateDifference(date1, date2) {
    const first = new Date(date1 + "T00:00:00");
    const second = new Date(date2 + "T00:00:00");

    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

function calculateStreak(habit) {
    if (!habit.completedDates || habit.completedDates.length === 0) {
        return 0;
    }

    const dates = [...new Set(habit.completedDates)].sort().reverse();

    const today = getToday();

    if (getDateDifference(dates[0], today) > 1) {
        return 0;
    }

    let streak = 1;

    for (let i = 0; i < dates.length - 1; i++) {
        const difference = getDateDifference(
            dates[i + 1],
            dates[i]
        );

        if (difference === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function getProgress(streak) {
    return Math.min(streak * 14.28, 100);
}

function displayHabits() {
    habitList.innerHTML = "";

    if (habits.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    habits.forEach(function (habit) {

        if (!habit.completedDates) {
            habit.completedDates = [];
        }

        const streak = calculateStreak(habit);
        const progress = getProgress(streak);
        const today = getToday();
        const completedToday = habit.completedDates.includes(today);

        const habitCard = document.createElement("div");

        habitCard.className = "habit-card";

        habitCard.innerHTML = `
            <div class="habit-info">

                <span class="category">General</span>

                <span>${habit.name}</span>

                <small>
                    ${habit.frequency} • ${streak} day${streak === 1 ? "" : "s"} streak
                </small>

                <div class="progress">
                    <div
                        class="progress-bar"
                        style="width: ${progress}%"
                    ></div>
                </div>

            </div>

            <div class="habit-actions">

                <button class="complete-btn">
                    ${completedToday ? "Completed" : "Complete"}
                </button>

                <button class="edit-btn">Edit</button>

                <button class="delete-btn">Delete</button>

            </div>
        `;

        const completeButton = habitCard.querySelector(".complete-btn");

        completeButton.addEventListener("click", function () {

            const today = getToday();

            if (!habit.completedDates.includes(today)) {
                habit.completedDates.push(today);
                saveHabits();
                displayHabits();
            }
        });

        habitList.appendChild(habitCard);
    });
}

habitForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = habitName.value.trim();
    const frequency = habitFrequency.value;

    if (name === "" || frequency === "") {
        alert("Please enter a habit name and select a frequency.");
        return;
    }

    const newHabit = {
        id: Date.now(),
        name: name,
        frequency: frequency,
        completedDates: []
    };

    habits.push(newHabit);

    saveHabits();

    displayHabits();

    habitName.value = "";
    habitFrequency.value = "";
});

displayHabits();