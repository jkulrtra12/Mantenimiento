// people.js
const personForm = document.getElementById('personForm');
const personNameInput = document.getElementById('personName');
const personPhoneInput = document.getElementById('personPhone');
const personCongregationInput = document.getElementById('personCongregation');
const personA2Input = document.getElementById('personA2');
const peopleTableBody = document.querySelector('#peopleTable tbody');
const editingPersonIdInput = document.getElementById('editingPersonId');

const taskResponsibleSelect = document.getElementById('taskResponsible');
const collaboratorToAddSelect = document.getElementById('collaboratorToAdd');
const responsibleDetailsDiv = document.getElementById('responsibleDetails');
const collaboratorDetailsDiv = document.getElementById('collaboratorDetails');

let people = JSON.parse(localStorage.getItem('salonPeople')) || [];

function savePeople() {
    localStorage.setItem('salonPeople', JSON.stringify(people));
}

function renderPeople() {
    peopleTableBody.innerHTML = '';
    taskResponsibleSelect.innerHTML = '<option value="">-- Seleccionar Encargado --</option>';
    collaboratorToAddSelect.innerHTML = '<option value="">-- Seleccionar Colaborador --</option>';

    people.sort((a, b) => a.name.localeCompare(b.name));

    people.forEach(person => {
        const row = peopleTableBody.insertRow();
        row.innerHTML = `
            <td>${person.name}</td>
            <td>${person.phone || '-'}</td>
            <td>${person.congregation || '-'}</td>
            <td>${person.a2 || '-'}</td>
            <td>
                <button class="btn action-btn btn-edit-person" data-id="${person.id}">Editar</button>
                <button class="btn action-btn btn-delete-person" data-id="${person.id}">Eliminar</button>
            </td>
        `;

        const optionResponsible = document.createElement('option');
        optionResponsible.value = person.id;
        optionResponsible.textContent = person.name;
        taskResponsibleSelect.appendChild(optionResponsible);

        const optionCollaborator = document.createElement('option');
        optionCollaborator.value = person.id;
        optionCollaborator.textContent = person.name;
        collaboratorToAddSelect.appendChild(optionCollaborator);
    });
    if (typeof window.updateTaskResponsibleAndCollaboratorsInTasks === 'function') {
        window.updateTaskResponsibleAndCollaboratorsInTasks();
    }
}

personForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const personId = editingPersonIdInput.value;
    const personData = {
        name: personNameInput.value.trim(),
        phone: personPhoneInput.value.trim(),
        congregation: personCongregationInput.value.trim(),
        a2: personA2Input.value.trim(),
    };

    if (!personData.name) {
        alert('El nombre de la persona es obligatorio.');
        return;
    }

    if (personId) {
        const index = people.findIndex(p => p.id === personId);
        if (index > -1) {
            people[index] = { ...people[index], ...personData };
        }
    } else {
        personData.id = Date.now().toString();
        people.push(personData);
    }

    savePeople();
    renderPeople();
    personForm.reset();
    editingPersonIdInput.value = '';
});

peopleTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-edit-person')) {
        const personId = e.target.dataset.id;
        const personToEdit = people.find(p => p.id === personId);
        if (personToEdit) {
            editingPersonIdInput.value = personToEdit.id;
            personNameInput.value = personToEdit.name;
            personPhoneInput.value = personToEdit.phone;
            personCongregationInput.value = personToEdit.congregation;
            personA2Input.value = personToEdit.a2;
            personNameInput.focus();
        }
    } else if (e.target.classList.contains('btn-delete-person')) {
        if (confirm('¿Estás seguro de eliminar a esta persona? Esto podría afectar tareas asignadas.')) {
            const personId = e.target.dataset.id;
            people = people.filter(p => p.id !== personId);
            savePeople();
            renderPeople();
        }
    }
});

function getPersonById(id) {
    return people.find(p => p.id === id);
}
window.getPersonNameById = (id) => { // Hacerla global para script.js
    const person = getPersonById(id);
    return person ? person.name : 'Desconocido';
};

function showPersonDetails(selectElement, detailsDiv) {
    const personId = selectElement.value;
    detailsDiv.innerHTML = '';
    detailsDiv.style.display = 'none';

    if (personId) {
        const person = getPersonById(personId);
        if (person) {
            let detailsHtml = `<strong>${person.name}</strong>`;
            if (person.phone) detailsHtml += `<br>Tel: ${person.phone}`;
            if (person.congregation) detailsHtml += `<br>Cong: ${person.congregation}`;
            if (person.a2) detailsHtml += `<br>A2: ${person.a2}`;
            detailsDiv.innerHTML = detailsHtml;
            detailsDiv.style.display = 'block';
        }
    }
}

taskResponsibleSelect.addEventListener('change', () => showPersonDetails(taskResponsibleSelect, responsibleDetailsDiv));
collaboratorToAddSelect.addEventListener('change', () => showPersonDetails(collaboratorToAddSelect, collaboratorDetailsDiv));

renderPeople();