// calendar.js
const calendarTableBody = document.querySelector('#taskCalendar tbody');
const currentMonthYearSpan = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const calendarTaskDetailsDiv = document.getElementById('calendarTaskDetails');

let currentDate = new Date();

window.renderCalendar = () => { // Hacerla global para ser llamada desde script.js
    calendarTableBody.innerHTML = '';
    calendarTaskDetailsDiv.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    currentMonthYearSpan.textContent = `${currentDate.toLocaleDateString('es-ES', { month: 'long' })} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay();

    let date = 1;
    for (let i = 0; i < 6; i++) {
        const row = calendarTableBody.insertRow();
        for (let j = 0; j < 7; j++) {
            const cell = row.insertCell();
            if (i === 0 && j < startingDay) {
                const prevMonthLastDay = new Date(year, month, 0);
                cell.textContent = prevMonthLastDay.getDate() - startingDay + j + 1;
                cell.classList.add('other-month');
            } else if (date > daysInMonth) {
                cell.textContent = date - daysInMonth;
                cell.classList.add('other-month');
                date++;
            } else {
                cell.textContent = date;
                const cellDate = new Date(year, month, date);
                const cellDateString = cellDate.toISOString().split('T')[0];

                if (cellDateString === new Date().toISOString().split('T')[0]) {
                    cell.classList.add('current-day');
                }
                // Acceder a tasks desde window.tasks (definido en script.js)
                if (window.tasks && window.tasks.length > 0) {
                    const tasksOnThisDay = window.tasks.filter(task => task.deadline === cellDateString && !task.completed);
                    if (tasksOnThisDay.length > 0) {
                        cell.classList.add('has-tasks');
                        const indicator = document.createElement('span');
                        indicator.classList.add('task-indicator');
                        indicator.textContent = `${tasksOnThisDay.length} T`;
                        cell.appendChild(indicator);
                        cell.dataset.date = cellDateString;
                    }
                }
                date++;
            }
        }
        if (date > daysInMonth && i < 5) {
             if(row.cells[0].classList.contains('other-month') && parseInt(row.cells[0].textContent) > 7) break;
        }
    }
}

calendarTableBody.addEventListener('click', (e) => {
    let targetCell = e.target;
    if (targetCell.tagName !== 'TD') {
        targetCell = targetCell.closest('td');
    }

    if (targetCell && targetCell.classList.contains('has-tasks')) {
        const dateStr = targetCell.dataset.date;
        if (window.tasks && typeof window.formatDate === 'function') {
            const tasksOnThisDay = window.tasks.filter(task => task.deadline === dateStr && !task.completed);
            
            calendarTaskDetailsDiv.innerHTML = `<h4>Tareas para ${window.formatDate(dateStr)}:</h4>`;
            if (tasksOnThisDay.length > 0) {
                const ul = document.createElement('ul');
                tasksOnThisDay.forEach(task => {
                    const li = document.createElement('li');
                    li.textContent = task.name;
                    ul.appendChild(li);
                });
                calendarTaskDetailsDiv.appendChild(ul);
            } else {
                calendarTaskDetailsDiv.innerHTML += '<p>No hay tareas pendientes para este día.</p>';
            }
        }
    }
});

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    window.renderCalendar();
    if (typeof window.renderGanttChart === 'function') window.renderGanttChart();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    window.renderCalendar();
    if (typeof window.renderGanttChart === 'function') window.renderGanttChart();
});