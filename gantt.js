// gantt.js
const ganttChartDiv = document.getElementById('ganttChart');

window.renderGanttChart = () => { // Hacerla global
    ganttChartDiv.innerHTML = '';

    const today = new Date();
    today.setHours(0,0,0,0); // Normalizar a inicio del día
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() + 30);

    // Acceder a tasks y formatDate desde window
    if (!window.tasks || typeof window.formatDate !== 'function' || typeof window.getPersonNameById !== 'function') {
        ganttChartDiv.innerHTML = '<p>Datos de tareas no disponibles.</p>';
        return;
    }

    const upcomingTasks = window.tasks
        .filter(task => {
            const deadlineDate = new Date(task.deadline + "T00:00:00");
            return !task.completed && deadlineDate >= today && deadlineDate <= thirtyDaysLater;
        })
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    if (upcomingTasks.length === 0) {
        ganttChartDiv.innerHTML = '<p>No hay tareas próximas en los siguientes 30 días.</p>';
        return;
    }

    upcomingTasks.forEach(task => {
        const item = document.createElement('div');
        item.classList.add('gantt-task-item');
        if (task.completed) {
            item.classList.add('completed');
        }
        
        const deadline = new Date(task.deadline + "T00:00:00");
        const diffTime = deadline - today; 
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let daysRemainingText = `(Faltan ${diffDays} días)`;
        if (deadline.toDateString() === today.toDateString()) {
            daysRemainingText = "(Hoy)";
        } else if (diffTime < 0) {
             daysRemainingText = `(Vencida hace ${Math.abs(diffDays)} días)`;
        }


        item.innerHTML = `
            <strong>${task.name}</strong>
            <span>Fecha Límite: ${window.formatDate(task.deadline)} ${daysRemainingText}</span>
            ${task.responsible ? `<span>Encargado: ${window.getPersonNameById(task.responsible)}</span>` : ''}
        `;
        ganttChartDiv.appendChild(item);
    });
}