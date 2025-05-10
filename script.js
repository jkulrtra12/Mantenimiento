// script.js
document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskListDiv = document.getElementById('taskList');
    const editingTaskIdInput = document.getElementById('editingTaskId');

    const taskNameInput = document.getElementById('taskName');
    const taskDeadlineInput = document.getElementById('taskDeadline');
    const taskRepetitionSelect = document.getElementById('taskRepetition');
    const taskResponsibleSelectFromForm = document.getElementById('taskResponsible');
    const taskInstructionsTextarea = document.getElementById('taskInstructions');
    const taskDocumentLinkInput = document.getElementById('taskDocumentLink');
    const taskDocumentFileInput = document.getElementById('taskDocumentFile');
    const taskDocumentsListUl = document.getElementById('taskDocumentsList');

    const collaboratorToAddSelectFromForm = document.getElementById('collaboratorToAdd');
    const addCollaboratorBtn = document.getElementById('addCollaboratorBtn');
    const collaboratorsListUl = document.getElementById('collaboratorsList');

    const supplyToAddInput = document.getElementById('supplyToAdd');
    const addSupplyBtn = document.getElementById('addSupplyBtn');
    const suppliesListUl = document.getElementById('suppliesList');

    const toolToAddInput = document.getElementById('toolToAdd');
    const addToolBtn = document.getElementById('addToolBtn');
    const toolsListUl = document.getElementById('toolsList');

    const clearFormBtn = document.getElementById('clearFormBtn');

    window.tasks = JSON.parse(localStorage.getItem('salonTasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('salonTasks', JSON.stringify(window.tasks));
        if (typeof window.renderCalendar === 'function') window.renderCalendar();
        if (typeof window.renderGanttChart === 'function') window.renderGanttChart();
    };

    function setupDynamicList(addBtn, inputElementOrSelect, listUl, type, isPersonSelect = false) {
        addBtn.addEventListener('click', () => {
            let value;
            let textContent;

            if (isPersonSelect) {
                if (!inputElementOrSelect.value) {
                    alert(`Seleccione un ${type.slice(0, -1)} para añadir.`);
                    return;
                }
                value = inputElementOrSelect.value;
                textContent = inputElementOrSelect.options[inputElementOrSelect.selectedIndex].text;
            } else {
                value = inputElementOrSelect.value.trim();
                textContent = value;
                if (!value) {
                    alert(`Ingrese un ${type.slice(0, -1)} para añadir.`);
                    return;
                }
            }
            
            const existingItems = Array.from(listUl.querySelectorAll('li span.item-text')).map(span => span.textContent.trim());
            if (existingItems.includes(textContent)) {
                alert(`${window.capitalizeFirstLetter(type.slice(0,-1))} '${textContent}' ya está en la lista.`);
                if (!isPersonSelect) inputElementOrSelect.value = '';
                return;
            }

            const listItem = document.createElement('li');
            listItem.dataset.id = isPersonSelect ? value : '';
            
            const itemTextSpan = document.createElement('span');
            itemTextSpan.classList.add('item-text');
            itemTextSpan.textContent = textContent;
            listItem.appendChild(itemTextSpan);

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'X';
            removeBtn.classList.add('remove-item-btn');
            removeBtn.type = 'button';
            removeBtn.onclick = () => listItem.remove();
            listItem.appendChild(removeBtn);

            listUl.appendChild(listItem);
            if (!isPersonSelect) inputElementOrSelect.value = '';
            else inputElementOrSelect.value = '';
        });
    }
    
    function getItemsFromList(listUl, isPersonSelect = false) {
        return Array.from(listUl.children).map(li => {
            const textContent = li.querySelector('span.item-text').textContent;
            return isPersonSelect ? { id: li.dataset.id, name: textContent } : textContent;
        });
    }

    function populateListFromData(listUl, dataArray, isPersonSelect = false) {
        listUl.innerHTML = '';
        if (!dataArray || dataArray.length === 0) return;

        dataArray.forEach(item => {
            const listItem = document.createElement('li');
            const itemTextSpan = document.createElement('span');
            itemTextSpan.classList.add('item-text');

            if (isPersonSelect && typeof item === 'object' && item !== null) {
                listItem.dataset.id = item.id;
                itemTextSpan.textContent = item.name;
            } else if (!isPersonSelect && typeof item === 'string') {
                 itemTextSpan.textContent = item;
            } else {
                // console.warn("populateListFromData: formato de item inesperado", item);
                return; 
            }
            listItem.appendChild(itemTextSpan);

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'X';
            removeBtn.classList.add('remove-item-btn');
            removeBtn.type = 'button';
            removeBtn.onclick = () => listItem.remove();
            listItem.appendChild(removeBtn);
            listUl.appendChild(listItem);
        });
    }
    
    taskDocumentFileInput.addEventListener('change', () => {
        taskDocumentsListUl.innerHTML = '';
        if (taskDocumentFileInput.files.length > 0) {
            const li = document.createElement('li');
            li.textContent = `Archivo: ${taskDocumentFileInput.files[0].name} `;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'X';
            removeBtn.classList.add('remove-item-btn');
            removeBtn.type = 'button';
            removeBtn.onclick = () => {
                li.remove();
                taskDocumentFileInput.value = '';
            };
            li.appendChild(removeBtn);
            taskDocumentsListUl.appendChild(li);
        }
    });

    setupDynamicList(addCollaboratorBtn, collaboratorToAddSelectFromForm, collaboratorsListUl, "colaboradores", true);
    setupDynamicList(addSupplyBtn, supplyToAddInput, suppliesListUl, "insumos");
    setupDynamicList(addToolBtn, toolToAddInput, toolsListUl, "herramientas");

    window.formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-ES', options);
    };
    
    const formatTextWithLinks = (text) => {
        if (!text) return '';
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(urlRegex, function(url) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });
    };

    window.capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // --- RENDER TASKS CON CORRECCIÓN PARA BOTONES ---
    const renderTasks = () => {
        taskListDiv.innerHTML = '';

        if (window.tasks.length === 0) {
            taskListDiv.innerHTML = '<p>No hay tareas programadas todavía.</p>';
            return;
        }

        const sortedTasks = [...window.tasks].sort((a, b) => {
            const dateA = new Date(a.deadline);
            const dateB = new Date(b.deadline);
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            return a.name.localeCompare(b.name);
        });

        sortedTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            taskItem.dataset.id = task.id; 

            let collaboratorsHtml = '';
            if (task.collaborators && task.collaborators.length > 0) {
                collaboratorsHtml = `<p><strong>Colaboradores:</strong></p><ul class="task-details-list">`;
                task.collaborators.forEach(collab => {
                    collaboratorsHtml += `<li>${collab.name || 'Nombre no disponible'}</li>`;
                });
                collaboratorsHtml += `</ul>`;
            }
            
            let suppliesHtml = '';
            if (task.supplies && task.supplies.length > 0) {
                suppliesHtml = `<p><strong>Insumos:</strong></p><ul class="task-details-list">`;
                task.supplies.forEach(supply => { suppliesHtml += `<li>${supply}</li>`; });
                suppliesHtml += `</ul>`;
            }

            let toolsHtml = '';
            if (task.tools && task.tools.length > 0) {
                toolsHtml = `<p><strong>Herramientas:</strong></p><ul class="task-details-list">`;
                task.tools.forEach(tool => { toolsHtml += `<li>${tool}</li>`; });
                toolsHtml += `</ul>`;
            }

            let documentsHtml = '';
            if (task.documentLink || task.documentFileName) {
                documentsHtml = '<p><strong>Documentos:</strong></p><ul class="task-details-list">';
                if (task.documentLink) {
                    documentsHtml += `<li><a href="${task.documentLink}" target="_blank" rel="noopener noreferrer">${task.documentLink}</a></li>`;
                }
                if (task.documentFileName) {
                    documentsHtml += `<li>Archivo: ${task.documentFileName}</li>`;
                }
                documentsHtml += '</ul>';
            }

            taskItem.innerHTML = `
                <h3>${task.name}</h3>
                <p><strong>Fecha Límite:</strong> ${window.formatDate(task.deadline)}</p>
                <p><strong>Repetición:</strong> ${window.capitalizeFirstLetter(task.repetition)}</p>
                <p><strong>Encargado:</strong> ${task.responsible && typeof window.getPersonNameById === 'function' ? window.getPersonNameById(task.responsible) : 'No asignado'}</p>
                ${collaboratorsHtml}
                ${task.instructions ? `<p><strong>Instrucciones:</strong><br>${formatTextWithLinks(task.instructions.replace(/\n/g, '<br>'))}</p>` : ''}
                ${documentsHtml}
                ${suppliesHtml}
                ${toolsHtml}
                <div class="task-actions">
                    <button class="btn btn-complete" data-id="${task.id}">${task.completed ? 'Marcar Pendiente' : 'Completada'}</button>
                    <button class="btn btn-edit" data-id="${task.id}">Editar</button>
                    <button class="btn btn-delete" data-id="${task.id}">Eliminar</button>
                </div>
            `;
            
            taskListDiv.appendChild(taskItem);
        });
    };
    // --- FIN DE RENDER TASKS CORREGIDA ---

    const resetAndClearForm = () => {
        taskForm.reset();
        editingTaskIdInput.value = '';
        collaboratorsListUl.innerHTML = '';
        suppliesListUl.innerHTML = '';
        toolsListUl.innerHTML = '';
        taskDocumentsListUl.innerHTML = '';
        taskDocumentFileInput.value = '';
        document.getElementById('responsibleDetails').style.display = 'none';
        document.getElementById('collaboratorDetails').style.display = 'none';
        document.querySelector('.btn-submit-task').textContent = 'Guardar Tarea';
        taskNameInput.focus();
    };

    clearFormBtn.addEventListener('click', resetAndClearForm);

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const editingId = editingTaskIdInput.value;

        let currentDocumentFileName = '';
        if (taskDocumentFileInput.files.length > 0) {
            currentDocumentFileName = taskDocumentFileInput.files[0].name;
        } else if (editingId) {
            const existingTask = window.tasks.find(t => t.id === editingId);
            // Conservar nombre de archivo si no se seleccionó uno nuevo Y la lista de documentos en el form está vacía
            // (lo que significa que el usuario no hizo clic en la 'X' del archivo existente al editar)
            if (taskDocumentsListUl.querySelector('li') && existingTask && existingTask.documentFileName) {
                 currentDocumentFileName = existingTask.documentFileName;
            } else {
                currentDocumentFileName = ''; // Si hizo clic en X o no había
            }
        }

        const taskData = {
            id: editingId || Date.now().toString(),
            name: taskNameInput.value.trim(),
            deadline: taskDeadlineInput.value,
            repetition: taskRepetitionSelect.value,
            responsible: taskResponsibleSelectFromForm.value,
            collaborators: getItemsFromList(collaboratorsListUl, true),
            instructions: taskInstructionsTextarea.value.trim(),
            documentLink: taskDocumentLinkInput.value.trim(),
            documentFileName: currentDocumentFileName,
            supplies: getItemsFromList(suppliesListUl),
            tools: getItemsFromList(toolsListUl),
            completed: editingId ? (window.tasks.find(t => t.id === editingId)?.completed || false) : false,
        };
        
        if (!taskData.name || !taskData.deadline || !taskData.responsible) {
            alert('Por favor, completa los campos obligatorios: Nombre, Fecha Límite y Encargado.');
            return;
        }

        if (editingId) {
            const taskIndex = window.tasks.findIndex(t => t.id === editingId);
            if (taskIndex > -1) {
                window.tasks[taskIndex] = taskData;
            }
        } else {
            window.tasks.push(taskData);
        }

        saveTasks();
        renderTasks();
        resetAndClearForm();
    });

    taskListDiv.addEventListener('click', (e) => {
        const target = e.target.closest('.btn');
        if (!target || !target.classList.contains('btn-complete') && !target.classList.contains('btn-edit') && !target.classList.contains('btn-delete')) {
             // Si no se hizo clic en un botón de acción, o en un hijo de él, salir
            return;
        }
        
        const taskId = target.dataset.id;
        if (!taskId) return;

        if (target.classList.contains('btn-complete')) {
            const taskIndex = window.tasks.findIndex(t => t.id === taskId);
            if (taskIndex > -1) {
                window.tasks[taskIndex].completed = !window.tasks[taskIndex].completed;
                saveTasks();
                renderTasks();
            }
        } else if (target.classList.contains('btn-delete')) {
            if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                window.tasks = window.tasks.filter(t => t.id !== taskId);
                saveTasks();
                renderTasks();
            }
        } else if (target.classList.contains('btn-edit')) {
            const taskToEdit = window.tasks.find(t => t.id === taskId);
            if (taskToEdit) {
                editingTaskIdInput.value = taskToEdit.id;
                taskNameInput.value = taskToEdit.name;
                taskDeadlineInput.value = taskToEdit.deadline;
                taskRepetitionSelect.value = taskToEdit.repetition;
                taskResponsibleSelectFromForm.value = taskToEdit.responsible || '';
                taskInstructionsTextarea.value = taskToEdit.instructions || '';
                taskDocumentLinkInput.value = taskToEdit.documentLink || '';
                
                taskDocumentsListUl.innerHTML = '';
                if (taskToEdit.documentFileName) {
                    const li = document.createElement('li');
                    li.textContent = `Archivo: ${taskToEdit.documentFileName} `;
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'X';
                    removeBtn.classList.add('remove-item-btn');
                    removeBtn.type = 'button';
                    removeBtn.onclick = () => {
                        li.remove();
                        taskDocumentFileInput.value = '';
                        // Actualizar el objeto en memoria para que si se guarda sin seleccionar nuevo archivo, se quede sin él
                        const taskBeingEdited = window.tasks.find(t => t.id === editingTaskIdInput.value);
                        if (taskBeingEdited) {
                            taskBeingEdited.documentFileName = '';
                        }
                    };
                    li.appendChild(removeBtn);
                    taskDocumentsListUl.appendChild(li);
                }
                taskDocumentFileInput.value = '';

                populateListFromData(collaboratorsListUl, taskToEdit.collaborators, true);
                populateListFromData(suppliesListUl, taskToEdit.supplies);
                populateListFromData(toolsListUl, taskToEdit.tools);
                
                if (typeof window.showPersonDetails === 'function' && taskResponsibleSelectFromForm.value) {
                     window.showPersonDetails(taskResponsibleSelectFromForm, document.getElementById('responsibleDetails'));
                }

                document.querySelector('.btn-submit-task').textContent = 'Actualizar Tarea';
                taskNameInput.focus();
                taskForm.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
    
    window.updateTaskResponsibleAndCollaboratorsInTasks = () => {
        renderTasks();
    };
    
    renderTasks();
    if (typeof window.renderCalendar === 'function') window.renderCalendar();
    if (typeof window.renderGanttChart === 'function') window.renderGanttChart();
});