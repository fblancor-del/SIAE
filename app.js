// VARIABLES GLOBALES
let currentUser = null;
let currentStudent = null;
let calificacionesExcel = {};
let html5QrCode = null;
let currentFlyerBase64 = null;
let currentHistoryStudent = null;
let tempCuadernillos = [];
let tempFormatos = [];
let currentEditingSpecialty = null;
let pendingProfilePhoto = null;
const DEFAULT_PROFILE_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e2e8f0'/%3E%3Ctext x='50' y='62' text-anchor='middle' font-size='42' fill='%2394a3b8'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";

// Almacenamiento de logos
const logos = {
    home: null,
    adminLogin: null,
    studentLogin: null,
    adminDash: null,
    studentDash: null
};

// DATOS DE DEMO
const demoData = {
    students: [
        { id: 1, numero_control: "2024001", nombre_completo: "Juan Perez Garcia", especialidad_nombre: "Programacion", seccion: "A", semestre_actual: 3, fecha_nacimiento: "2005-03-15", email: "juan@email.com", telefono: "555-0101", direccion: "Calle 123" },
        { id: 2, numero_control: "2024002", nombre_completo: "Maria Lopez Silva", especialidad_nombre: "Contabilidad", seccion: "B", semestre_actual: 2, fecha_nacimiento: "2006-07-22", email: "maria@email.com", telefono: "555-0102", direccion: "Calle 456" },
        { id: 3, numero_control: "2024003", nombre_completo: "Carlos Ruiz Mendoza", especialidad_nombre: "Electronica", seccion: "A", semestre_actual: 4, fecha_nacimiento: "2004-11-08", email: "carlos@email.com", telefono: "555-0103", direccion: "Calle 789" }
    ],
    teachers: [
        { id: 1, nombre_completo: "Prof. Roberto Sanchez", especialidad: "Matematicas", email: "roberto@escuela.edu", telefono: "555-0201" },
        { id: 2, nombre_completo: "Prof. Ana Martinez", especialidad: "Historia", email: "ana@escuela.edu", telefono: "555-0202" },
        { id: 3, nombre_completo: "Prof. Luis Hernandez", especialidad: "Programacion", email: "luis@escuela.edu", telefono: "555-0203" }
    ],
    grades: [
        { id: 1, alumno_nombre: "Juan Perez Garcia", numero_control: "2024001", materia_nombre: "Matematicas", calificacion: 8.5, semestre: 3, parcial: 1 },
        { id: 2, alumno_nombre: "Juan Perez Garcia", numero_control: "2024001", materia_nombre: "Programacion", calificacion: 9.2, semestre: 3, parcial: 2 },
        { id: 3, alumno_nombre: "Maria Lopez Silva", numero_control: "2024002", materia_nombre: "Contabilidad", calificacion: 9.0, semestre: 2, parcial: 1 }
    ],
    events: [
        { id: 1, titulo: "Feria de Ciencias", fecha_evento: "2024-03-15", hora_evento: "10:00", lugar: "Auditorio Principal", tipo: "academico", flyer: null },
        { id: 2, titulo: "Torneo Deportivo", fecha_evento: "2024-03-20", hora_evento: "14:00", lugar: "Cancha Deportiva", tipo: "deportivo", flyer: null }
    ],
    appointments: [
        { id: 1, alumno_nombre: "Juan Perez Garcia", docente_nombre: "Prof. Roberto Sanchez", fecha_cita: "2024-03-10", hora_cita: "11:00", estado: "pendiente" },
        { id: 2, alumno_nombre: "Maria Lopez Silva", docente_nombre: "Prof. Ana Martinez", fecha_cita: "2024-03-12", hora_cita: "12:30", estado: "pendiente" }
    ],
    specialties: [
        { id: 1, nombre: "Programacion", descripcion: "Desarrollo de software y aplicaciones", cuadernillos: [], formatos: [] },
        { id: 2, nombre: "Contabilidad", descripcion: "Gestion financiera y contable", cuadernillos: [], formatos: [] },
        { id: 3, nombre: "Electronica", descripcion: "Circuitos y sistemas electronicos", cuadernillos: [], formatos: [] },
        { id: 4, nombre: "Mecanica", descripcion: "Mantenimiento de maquinaria", cuadernillos: [], formatos: [] }
    ]
};

const API_BASE = 'api';

async function apiRequest(endpoint, options = {}) {
    const requestOptions = { ...options };
    requestOptions.headers = {
        ...(options.headers || {})
    };

    if (requestOptions.body && !requestOptions.headers['Content-Type']) {
        requestOptions.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}/${endpoint}`, requestOptions);
    let payload = null;

    try {
        payload = await response.json();
    } catch (error) {
        throw new Error('Respuesta invalida del servidor');
    }

    if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Error en la solicitud');
    }

    return payload;
}

// SISTEMA DE TOASTS
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    const icons = {
        success: 'âœ“',
        error: 'âœ•',
        warning: 'âš ',
        info: 'â„¹'
    };
    
    toast.style.cssText = `
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 300px;
        animation: slideIn 0.3s ease;
        font-weight: 500;
        z-index: 10000;
    `;
    
    toast.innerHTML = `
        <span style="font-size: 1.2rem;">${icons[type]}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// FUNCIONES PARA LOGO
function updateLogo(input, location) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgData = e.target.result;
            logos[location] = imgData;
            
            let elementId;
            switch(location) {
                case 'home': elementId = 'logo-home'; break;
                case 'admin-login': elementId = 'logo-admin-login'; break;
                case 'student-login': elementId = 'logo-student-login'; break;
                case 'admin-dash': elementId = 'logo-admin-dash'; break;
                case 'student-dash': elementId = 'logo-student-dash'; break;
            }
            
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = `<img src="${imgData}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;">`;
                element.style.background = 'white';
                element.style.padding = '5px';
            }
            
            showToast('Logo actualizado correctamente', 'success');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// NAVEGACION
function showPage(page) {
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('admin-login').classList.remove('active');
    document.getElementById('student-login').classList.remove('active');
    document.getElementById('admin-dashboard').classList.remove('active');
    document.getElementById('student-dashboard').classList.remove('active');
    
    if (html5QrCode && page !== 'student-login') {
        detenerQRLogin();
    }
    
    // Cerrar todos los modales al cambiar de pÃ¡gina
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    
    if (page === 'home') {
        document.getElementById('home-page').style.display = 'flex';
    } else if (page === 'admin-login') {
        document.getElementById('admin-login').classList.add('active');
    } else if (page === 'student-login') {
        document.getElementById('student-login').classList.add('active');
    } else if (page === 'admin-dashboard') {
        document.getElementById('admin-dashboard').classList.add('active');
        loadAdminDashboard();
    } else if (page === 'student-dashboard') {
        document.getElementById('student-dashboard').classList.add('active');
        loadStudentDashboard();
    }

    updateProfileEditButtonVisibility();
}

function showModule(module) {
    const clickedLink = event && event.target ? event.target : null;
    
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    if (clickedLink) {
        clickedLink.classList.add('active');
    }
    
    document.querySelectorAll('#admin-dashboard .module-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById('module-' + module).classList.add('active');
    
    switch(module) {
        case 'students': loadStudents(); break;
        case 'teachers': loadTeachers(); break;
        case 'grades': loadGrades(); break;
        case 'events': loadEvents(); break;
        case 'appointments': loadAppointments(); break;
        case 'specialties': loadSpecialties(); break;
    }
}

function showModuleStudent(module) {
    const clickedLink = event && event.target ? event.target : null;
    
    document.querySelectorAll('#student-dashboard .sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    if (clickedLink) {
        clickedLink.classList.add('active');
    }
    
    document.querySelectorAll('#student-dashboard .module-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById('module-' + module).classList.add('active');
    
    switch(module) {
        case 'student-grades': loadStudentGrades(); break;
        case 'student-specialty': loadStudentSpecialtyResources(); break;
        case 'student-events': loadStudentEvents(); break;
        case 'student-appointments': loadStudentAppointments();
    }

    updateProfileEditButtonVisibility();
}

function updateProfileEditButtonVisibility() {
    const fab = document.querySelector('.fab-edit-profile');
    if (!fab) return;

    const studentDashboardActive = document.getElementById('student-dashboard').classList.contains('active');
    const profileModuleActive = document.getElementById('module-student-overview').classList.contains('active');
    fab.style.display = studentDashboardActive && profileModuleActive ? 'inline-flex' : 'none';
}

function getCurrentStudentRecord() {
    if (!currentStudent) return null;
    return demoData.students.find(s => s.id === currentStudent.id || s.numero_control === currentStudent.numero_control) || null;
}

function refreshStudentProfileUI() {
    if (!currentStudent) return;

    const student = getCurrentStudentRecord();
    if (!student) return;

    document.getElementById('student-name').textContent = student.nombre_completo;
    document.getElementById('student-info-name').textContent = student.nombre_completo;
    document.getElementById('student-info-control').textContent = student.numero_control;
    document.getElementById('student-info-specialty').textContent = student.especialidad_nombre || 'No asignada';
    document.getElementById('student-info-semester').textContent = student.semestre_actual || 'No asignado';
    document.getElementById('student-info-email').textContent = student.email || 'No registrado';
    document.getElementById('student-info-phone').textContent = student.telefono || 'No registrado';
    document.getElementById('student-info-birth').textContent = student.fecha_nacimiento || 'No registrada';
    document.getElementById('student-info-section').textContent = student.seccion || 'No asignada';
    document.getElementById('student-info-address').textContent = student.direccion || 'No registrada';
    document.getElementById('student-info-emergency-name').textContent = student.emergencia_nombre || 'No registrado';
    document.getElementById('student-info-emergency-phone').textContent = student.emergencia_telefono || 'No registrado';

    const profilePhoto = student.foto || DEFAULT_PROFILE_PHOTO;
    document.getElementById('student-profile-photo').src = profilePhoto;

    currentStudent.nombre = student.nombre_completo;
    currentStudent.numero_control = student.numero_control;
    currentStudent.especialidad = student.especialidad_nombre;
    currentStudent.semestre = student.semestre_actual;
    currentStudent.fecha_nacimiento = student.fecha_nacimiento;
    currentStudent.email = student.email || '';
    currentStudent.telefono = student.telefono || '';
}

function openProfileModal() {
    if (!currentStudent) {
        showToast('Debes iniciar sesion como estudiante', 'error');
        return;
    }

    const student = getCurrentStudentRecord();
    if (!student) return;

    document.getElementById('edit-nombre').value = student.nombre_completo || '';
    document.getElementById('edit-control').value = student.numero_control || '';
    document.getElementById('edit-nacimiento').value = student.fecha_nacimiento || '';
    document.getElementById('edit-especialidad').value = student.especialidad_nombre || '';
    document.getElementById('edit-semestre').value = student.semestre_actual || '';
    document.getElementById('edit-email').value = student.email || '';
    document.getElementById('edit-telefono').value = student.telefono || '';
    document.getElementById('edit-direccion').value = student.direccion || '';
    document.getElementById('edit-emergencia-nombre').value = student.emergencia_nombre || '';
    document.getElementById('edit-emergencia-tel').value = student.emergencia_telefono || '';

    pendingProfilePhoto = student.foto || null;
    document.getElementById('profile-preview').src = student.foto || DEFAULT_PROFILE_PHOTO;

    document.getElementById('unlock-code').value = '';
    document.getElementById('new-password-date').value = '';
    document.getElementById('confirm-password-date').value = '';
    document.getElementById('password-change-section').style.display = 'none';
    document.getElementById('unlock-status').textContent = 'Ingresa 1156 para desbloquear';
    document.getElementById('unlock-status').style.color = '#6b7280';

    openModal('profile-edit-modal');
}

function closeProfileModal() {
    closeModal('profile-edit-modal');
}

function previewPhoto(input) {
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        pendingProfilePhoto = e.target.result;
        document.getElementById('profile-preview').src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function takePhoto() {
    document.getElementById('photo-input').click();
}

function checkUnlockCode(value) {
    const unlocked = value === '1156';
    const status = document.getElementById('unlock-status');
    const section = document.getElementById('password-change-section');

    section.style.display = unlocked ? 'block' : 'none';
    status.textContent = unlocked ? 'Codigo correcto. Ya puedes cambiar la contrasena' : 'Ingresa 1156 para desbloquear';
    status.style.color = unlocked ? '#166534' : '#6b7280';
}

async function changePassword() {
    const unlockCode = document.getElementById('unlock-code').value;
    const newDate = document.getElementById('new-password-date').value;
    const confirmDate = document.getElementById('confirm-password-date').value;

    if (unlockCode !== '1156') {
        showToast('Codigo de desbloqueo incorrecto', 'error');
        return;
    }
    if (!newDate || !confirmDate) {
        showToast('Completa ambas fechas para actualizar la contrasena', 'error');
        return;
    }
    if (newDate !== confirmDate) {
        showToast('La confirmacion no coincide', 'error');
        return;
    }

    if (!currentStudent || !currentStudent.id) {
        showToast('No hay estudiante activo', 'error');
        return;
    }

    try {
        await apiRequest('student_profile.php', {
            method: 'PUT',
            body: JSON.stringify({
                id: Number(currentStudent.id),
                fecha_nacimiento: newDate
            })
        });

        const student = getCurrentStudentRecord();
        if (student) {
            student.fecha_nacimiento = newDate;
        }

        currentStudent.fecha_nacimiento = newDate;
        document.getElementById('edit-nacimiento').value = newDate;
        refreshStudentProfileUI();
        showToast('Contrasena actualizada correctamente', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo actualizar la contrasena', 'error');
    }
}

async function saveProfile(event) {
    event.preventDefault();
    const student = getCurrentStudentRecord();
    if (!student || !currentStudent || !currentStudent.id) return;

    const newName = document.getElementById('edit-nombre').value.trim();
    const newSemester = Number(document.getElementById('edit-semestre').value) || student.semestre_actual;

    const payload = {
        id: Number(currentStudent.id),
        nombre_completo: newName,
        semestre_actual: newSemester,
        email: document.getElementById('edit-email').value.trim() || null,
        telefono: document.getElementById('edit-telefono').value.trim() || null,
        direccion: document.getElementById('edit-direccion').value.trim() || null,
        emergencia_nombre: document.getElementById('edit-emergencia-nombre').value.trim() || null,
        emergencia_telefono: document.getElementById('edit-emergencia-tel').value.trim() || null,
        foto: pendingProfilePhoto || student.foto || null
    };

    try {
        await apiRequest('student_profile.php', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        student.nombre_completo = payload.nombre_completo;
        student.semestre_actual = payload.semestre_actual;
        student.email = payload.email;
        student.telefono = payload.telefono;
        student.direccion = payload.direccion;
        student.emergencia_nombre = payload.emergencia_nombre;
        student.emergencia_telefono = payload.emergencia_telefono;
        student.foto = payload.foto;

        await loadStudents();
        await loadAppointments();
        await loadGrades();

        refreshStudentProfileUI();
        loadStudentGrades();
        loadStudentAppointments();
        closeProfileModal();
        showToast('Perfil actualizado correctamente', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo actualizar el perfil', 'error');
    }
}

// MODALES MEJORADOS
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    modal.style.display = 'flex';
    
    if (modalId === 'appointment-modal') {
        loadStudentsSelectForAppointment();
        loadTeachersSelectForAppointmentAdmin();
        const appointmentId = document.getElementById('appointment-id').value;
        if (!appointmentId) {
            setAppointmentEditMode(false);
            document.getElementById('appointment-modal-title').textContent = 'Agendar Cita';
            document.getElementById('appointment-submit-btn').textContent = 'Agendar';
            document.getElementById('appointment-form').reset();
            document.getElementById('appointment-status-select').value = 'espera';
        }
    } else if (modalId === 'student-appointment-modal') {
        loadTeachersSelectForAppointment();
    } else if (modalId === 'student-modal') {
        const studentId = document.querySelector('#student-form input[name="id"]').value;
        if (!studentId) {
            document.getElementById('student-modal-title').textContent = 'Agregar Alumno';
            document.getElementById('student-form').reset();
            document.getElementById('qr-container').style.display = 'none';
        }
    } else if (modalId === 'event-modal') {
        const eventId = document.querySelector('#event-form input[name="id"]').value;
        if (!eventId) {
            document.getElementById('event-modal-title').textContent = 'Crear Evento';
            document.getElementById('event-form').reset();
            document.getElementById('flyer-preview').style.display = 'none';
            currentFlyerBase64 = null;
        }
    } else if (modalId === 'teacher-modal') {
        const teacherId = document.querySelector('#teacher-form input[name="id"]').value;
        if (!teacherId) {
            document.getElementById('teacher-modal-title').textContent = 'Agregar Docente';
            document.getElementById('teacher-form').reset();
        }
    } else if (modalId === 'grade-modal') {
        loadStudentsSelect();
        loadTeachersSelect();
        loadSubjectsSelect();
    } else if (modalId === 'material-upload-modal') {
        loadSpecialtiesSelectForMaterial();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    modal.style.display = 'none';
    
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
        // Limpiar inputs file especÃ­ficos
        const fileInputs = form.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.value = '';
        });
    }
    
    // Resetear estados especÃ­ficos
    if (modalId === 'teacher-modal') {
        document.querySelector('#teacher-form input[name="id"]').value = '';
        document.getElementById('teacher-modal-title').textContent = 'Agregar Docente';
    }
    if (modalId === 'student-modal') {
        document.querySelector('#student-form input[name="id"]').value = '';
        document.getElementById('student-modal-title').textContent = 'Agregar Alumno';
        document.getElementById('qr-container').style.display = 'none';
    }
    if (modalId === 'event-modal') {
        document.querySelector('#event-form input[name="id"]').value = '';
        document.getElementById('event-modal-title').textContent = 'Crear Evento';
        document.getElementById('flyer-preview').style.display = 'none';
        currentFlyerBase64 = null;
    }
    if (modalId === 'specialty-modal') {
        tempCuadernillos = [];
        tempFormatos = [];
        currentEditingSpecialty = null;
        document.getElementById('specialty-id').value = '';
        document.getElementById('specialty-modal-title').textContent = 'Agregar Especialidad';
    }
    if (modalId === 'material-upload-modal') {
        tempCuadernillos = [];
        tempFormatos = [];
        const cuadernillosList = document.getElementById('material-cuadernillos-list');
        const formatosList = document.getElementById('material-formatos-list');
        if (cuadernillosList) cuadernillosList.innerHTML = '';
        if (formatosList) formatosList.innerHTML = '';
    }
    if (modalId === 'appointment-modal') {
        document.getElementById('appointment-id').value = '';
        setAppointmentEditMode(false);
        document.getElementById('appointment-modal-title').textContent = 'Agendar Cita';
        document.getElementById('appointment-submit-btn').textContent = 'Agendar';
        document.getElementById('appointment-status-select').value = 'espera';
    }
}

function openAddSpecialtyModal() {
    currentEditingSpecialty = null;
    document.getElementById('specialty-id').value = '';
    document.getElementById('specialty-modal-title').textContent = 'Agregar Especialidad';
    document.getElementById('specialty-form').reset();
    openModal('specialty-modal');
}

function openUploadMaterialModal() {
    tempCuadernillos = [];
    tempFormatos = [];
    openModal('material-upload-modal');
}

// Cerrar modal al hacer clic en el fondo
function closeModalOnBackground(event, modalId) {
    if (event.target.id === modalId) {
        closeModal(modalId);
    }
}

// Cerrar modal con tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            closeModal(modal.id);
        });
    }
});

// ================= FUNCIONES QR =================
async function iniciarQRLogin() {
    const container = document.getElementById('qr-reader-container-student');
    const placeholder = document.getElementById('qr-student-placeholder');
    const cancelBtn = document.getElementById('btn-cancel-qr');
    
    placeholder.style.display = 'none';
    container.style.display = 'block';
    cancelBtn.style.display = 'inline-block';
    
    try {
        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("reader-student");
        }
        
        await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 200, height: 200 } },
            (decodedText) => {
                try {
                    const datos = JSON.parse(decodedText);
                    if (datos.nc && datos.fn) {
                        document.getElementById('login-nc').value = datos.nc;
                        document.getElementById('login-fn').value = datos.fn;
                        detenerQRLogin();
                        showToast('QR escaneado correctamente. Datos autocompletados.', 'success');
                    } else {
                        showToast('QR invalido: faltan datos requeridos', 'error');
                    }
                } catch (e) {
                    showToast('QR invalido: formato incorrecto', 'error');
                }
            },
            (errorMessage) => {}
        );
    } catch (err) {
        console.error("Error al iniciar escaner QR:", err);
        showToast('Error al acceder a la camara. Asegurate de dar permisos.', 'error');
        container.style.display = 'none';
        placeholder.style.display = 'block';
    }
}

async function detenerQRLogin() {
    if (html5QrCode) {
        try {
            await html5QrCode.stop();
            await html5QrCode.clear();
        } catch (e) {
            console.warn("Error al detener escaner:", e);
        }
    }
    document.getElementById('qr-reader-container-student').style.display = 'none';
    document.getElementById('qr-student-placeholder').style.display = 'flex';
    document.getElementById('btn-cancel-qr').style.display = 'none';
}

function generarQRAlumno() {
    const nc = document.getElementById('student-nc')?.value;
    const fecha = document.getElementById('student-fn')?.value;

    if (!nc || !fecha) {
        showToast('Faltan datos para generar QR. Se requiere Numero de Control y Fecha de Nacimiento', 'error');
        return;
    }

    const dataQR = JSON.stringify({ nc: nc, fn: fecha });
    
    const qrContainer = document.getElementById('qr-container');
    qrContainer.style.display = 'block';
    
    const canvas = document.getElementById("qrCanvas");
    
    QRCode.toCanvas(canvas, dataQR, { 
        width: 180, 
        margin: 1,
        color: { dark: '#1e40af', light: '#ffffff' }
    }, function(error) {
        if (error) {
            console.error('Error generando QR:', error);
            showToast('Error al generar QR', 'error');
        } else {
            showToast('QR generado exitosamente', 'success');
        }
    });
}

// ================= FUNCIONES EXCEL =================
async function toggleExcelSection() {
    const section = document.getElementById('excel-section');
    const willOpen = section.style.display === 'none';
    section.style.display = willOpen ? 'block' : 'none';

    if (willOpen) {
        await loadSubjectsSelect('excel-materia-select');
    }
}

async function subirExcel() {
    const fileInput = document.getElementById("excelFile");
    const materiaSelect = document.getElementById("excel-materia-select");
    
    if (!fileInput || !materiaSelect) {
        showToast('Error: Elementos del formulario no encontrados', 'error');
        return;
    }

    const file = fileInput.files[0];
    const materiaId = materiaSelect.value;
    const materiaNombre = materiaSelect.options[materiaSelect.selectedIndex]?.text || 'Sin materia';

    if (!file) {
        showToast('Selecciona un archivo Excel', 'error');
        return;
    }
    
    if (!materiaId) {
        showToast('Selecciona una materia', 'error');
        return;
    }

    const readAsArrayBuffer = (inputFile) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsArrayBuffer(inputFile);
    });

    const getValueFromRow = (row, key) => {
        const directValue = row[key];
        if (directValue !== undefined && directValue !== null && String(directValue).trim() !== '') {
            return directValue;
        }

        const normalizedTarget = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const foundKey = Object.keys(row).find((rowKey) => {
            const normalizedKey = String(rowKey).toLowerCase().replace(/[^a-z0-9]/g, '');
            return normalizedKey === normalizedTarget;
        });

        if (!foundKey) return null;
        const foundValue = row[foundKey];
        return foundValue === undefined || foundValue === null || String(foundValue).trim() === '' ? null : foundValue;
    };

    try {
        const buffer = await readAsArrayBuffer(file);
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            showToast('El archivo Excel no contiene hojas', 'error');
            return;
        }

        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(hoja);

        if (!rows || rows.length === 0) {
            showToast('No se encontraron datos en el Excel', 'error');
            return;
        }

        const payloadRows = [];
        rows.forEach((row) => {
            const numeroControl = getValueFromRow(row, 'numero_control');
            const calificacion = Number(getValueFromRow(row, 'calificacion'));
            const semestre = Number(getValueFromRow(row, 'semestre') || 1);
            const parcial = Number(getValueFromRow(row, 'parcial') || 1);

            if (!numeroControl || Number.isNaN(calificacion)) {
                return;
            }

            payloadRows.push({
                numero_control: String(numeroControl).trim(),
                calificacion,
                semestre,
                parcial
            });
        });

        if (payloadRows.length === 0) {
            showToast('No se encontraron filas validas (numero_control y calificacion)', 'error');
            return;
        }

        const response = await apiRequest('grades_bulk.php', {
            method: 'POST',
            body: JSON.stringify({
                materia_id: Number(materiaId),
                rows: payloadRows
            })
        });

        await loadGrades();
        showToast(`Calificaciones cargadas en BD: ${response.inserted} de ${payloadRows.length} (${materiaNombre})`, 'success');
    } catch (error) {
        console.error('Error procesando Excel:', error);
        showToast(error.message || 'Error al procesar el archivo Excel', 'error');
    }
}

// ================= FUNCIONES EVENTOS CON FLYER =================
function previewFlyer(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentFlyerBase64 = e.target.result;
            document.getElementById('flyer-img-preview').src = e.target.result;
            document.getElementById('flyer-preview').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ================= FUNCIONES ESPECIALIDADES MEJORADAS =================
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado'));
        reader.readAsDataURL(file);
    });
}

async function handleCuadernillosSelect(input) {
    if (!input.files || input.files.length === 0) return;

    try {
        const files = Array.from(input.files);
        const loaded = await Promise.all(files.map(async (file) => ({
            name: file.name,
            url: await readFileAsDataURL(file),
            type: 'new'
        })));
        tempCuadernillos.push(...loaded);
        renderCuadernillosList();
    } catch (error) {
        showToast(error.message || 'No se pudieron cargar cuadernillos', 'error');
    } finally {
        input.value = '';
    }
}

async function handleFormatosSelect(input) {
    if (!input.files || input.files.length === 0) return;

    try {
        const files = Array.from(input.files);
        const loaded = await Promise.all(files.map(async (file) => ({
            name: file.name,
            url: await readFileAsDataURL(file),
            type: 'new'
        })));
        tempFormatos.push(...loaded);
        renderFormatosList();
    } catch (error) {
        showToast(error.message || 'No se pudieron cargar formatos', 'error');
    } finally {
        input.value = '';
    }
}

function renderCuadernillosList() {
    const container = document.getElementById('material-cuadernillos-list');
    if (!container) return;
    container.innerHTML = '';
    
    tempCuadernillos.forEach((item, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f3f4f6; border-radius: 4px; margin-bottom: 0.5rem;';
        div.innerHTML = `
            <span style="font-size: 0.9rem;">ðŸ“„ ${item.name}</span>
            <button type="button" onclick="removeCuadernillo(${index})" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer;">Eliminar</button>
        `;
        container.appendChild(div);
    });
}

function renderFormatosList() {
    const container = document.getElementById('material-formatos-list');
    if (!container) return;
    container.innerHTML = '';
    
    tempFormatos.forEach((item, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: #f3f4f6; border-radius: 4px; margin-bottom: 0.5rem;';
        div.innerHTML = `
            <span style="font-size: 0.9rem;">ðŸ“‹ ${item.name}</span>
            <button type="button" onclick="removeFormato(${index})" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 0.25rem 0.5rem; cursor: pointer;">Eliminar</button>
        `;
        container.appendChild(div);
    });
}

function removeCuadernillo(index) {
    tempCuadernillos.splice(index, 1);
    renderCuadernillosList();
}

function removeFormato(index) {
    tempFormatos.splice(index, 1);
    renderFormatosList();
}

async function handleSpecialtySubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');
    
    const specialtyData = {
        nombre: formData.get('nombre'),
        descripcion: formData.get('descripcion')
    };
    
    try {
        if (id) {
            await apiRequest(`specialties.php?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(specialtyData)
            });
            showToast('Especialidad actualizada correctamente', 'success');
        } else {
            await apiRequest('specialties.php', {
                method: 'POST',
                body: JSON.stringify(specialtyData)
            });
            showToast('Especialidad agregada correctamente', 'success');
        }

        closeModal('specialty-modal');
        await loadSpecialties();
        if (currentStudent) loadStudentSpecialtyResources();
    } catch (error) {
        showToast(error.message || 'No se pudo guardar la especialidad', 'error');
    }
}

async function loadSpecialtiesSelectForMaterial() {
    const select = document.getElementById('material-specialty-select');
    if (!select) return;
    if (!demoData.specialties || demoData.specialties.length === 0) {
        await loadSpecialties();
    }
    select.innerHTML = '<option value="">Seleccionar...</option>';
    demoData.specialties.forEach(specialty => {
        select.innerHTML += `<option value="${specialty.id}">${specialty.nombre}</option>`;
    });
}

async function handleMaterialUploadSubmit(e) {
    e.preventDefault();
    const specialtyId = Number(document.getElementById('material-specialty-select').value);
    if (!specialtyId) {
        showToast('Selecciona una materia/especialidad', 'warning');
        return;
    }

    try {
        await apiRequest('specialty_materials.php', {
            method: 'POST',
            body: JSON.stringify({
                specialty_id: specialtyId,
                cuadernillos: tempCuadernillos.map(c => ({ name: c.name, url: c.url || '' })),
                formatos: tempFormatos.map(f => ({ name: f.name, url: f.url || '' }))
            })
        });

        closeModal('material-upload-modal');
        await loadSpecialties();
        if (currentStudent) loadStudentSpecialtyResources();
        showToast('Material cargado correctamente', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo cargar el material', 'error');
    }
}

// ================= DESCARGAS PDF Y EXCEL =================
function descargarMisCalificacionesPDF() {
    if (!currentStudent) {
        showToast('Error: No hay sesion de estudiante activa', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const calificaciones = demoData.grades.filter(g => g.numero_control === currentStudent.numero_control);
    
    doc.setFontSize(20);
    doc.text('Calificaciones del Estudiante', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Alumno: ${currentStudent.nombre}`, 20, 40);
    doc.text(`No. Control: ${currentStudent.numero_control}`, 20, 50);
    doc.text(`Especialidad: ${currentStudent.especialidad || 'No asignada'}`, 20, 60);
    
    let y = 80;
    doc.setFontSize(10);
    doc.text('Materia', 20, y);
    doc.text('Calificacion', 100, y);
    doc.text('Semestre', 140, y);
    doc.text('Parcial', 170, y);
    
    y += 10;
    calificaciones.forEach(cal => {
        doc.text(cal.materia_nombre, 20, y);
        doc.text(cal.calificacion.toString(), 100, y);
        doc.text(cal.semestre.toString(), 140, y);
        doc.text(cal.parcial.toString(), 170, y);
        y += 10;
    });
    
    doc.save(`calificaciones_${currentStudent.numero_control}.pdf`);
    showToast('Calificaciones descargadas en PDF', 'success');
}

function descargarMisCalificacionesXLSX() {
    if (!currentStudent) {
        showToast('Error: No hay sesion de estudiante activa', 'error');
        return;
    }
    
    const calificaciones = demoData.grades.filter(g => g.numero_control === currentStudent.numero_control);
    
    const data = calificaciones.map(cal => ({
        Materia: cal.materia_nombre,
        Docente: 'Profesor Asignado',
        Calificacion: cal.calificacion,
        Semestre: cal.semestre,
        Parcial: cal.parcial
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Calificaciones");
    
    XLSX.writeFile(wb, `calificaciones_${currentStudent.numero_control}.xlsx`);
    showToast('Calificaciones descargadas en Excel', 'success');
}

function descargarCedulaPDF() {
    if (!currentStudent) {
        showToast('No hay sesion activa', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Cedula de Perfil', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Institucion: DGETI - SIEA`, 20, 40);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 50);
    
    doc.text(`Nombre: ${currentStudent.nombre}`, 20, 70);
    doc.text(`No. Control: ${currentStudent.numero_control}`, 20, 80);
    doc.text(`Especialidad: ${currentStudent.especialidad || 'No asignada'}`, 20, 90);
    doc.text(`Semestre: ${currentStudent.semestre}`, 20, 100);
    doc.text(`Email: ${document.getElementById('student-info-email').textContent}`, 20, 110);
    doc.text(`Telefono: ${document.getElementById('student-info-phone').textContent}`, 20, 120);
    
    doc.save(`cedula_perfil_${currentStudent.numero_control}.pdf`);
    showToast('Cedula descargada en PDF', 'success');
}

function descargarCedulaXLSX() {
    if (!currentStudent) {
        showToast('No hay sesion activa', 'error');
        return;
    }
    
    const data = [{
        Campo: 'Nombre',
        Valor: currentStudent.nombre
    }, {
        Campo: 'No. Control',
        Valor: currentStudent.numero_control
    }, {
        Campo: 'Especialidad',
        Valor: currentStudent.especialidad || 'No asignada'
    }, {
        Campo: 'Semestre',
        Valor: currentStudent.semestre
    }, {
        Campo: 'Email',
        Valor: document.getElementById('student-info-email').textContent
    }, {
        Campo: 'Telefono',
        Valor: document.getElementById('student-info-phone').textContent
    }];
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cedula de Perfil");
    
    XLSX.writeFile(wb, `cedula_perfil_${currentStudent.numero_control}.xlsx`);
    showToast('Cedula descargada en Excel', 'success');
}

function descargarConstanciaPDF() {
    if (!currentHistoryStudent) {
        showToast('No hay historial para descargar', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Constancia de Estudios', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Alumno: ${currentHistoryStudent.nombre_completo}`, 20, 40);
    doc.text(`No. Control: ${currentHistoryStudent.numero_control}`, 20, 50);
    doc.text(`Especialidad: ${currentHistoryStudent.especialidad_nombre || 'No asignada'}`, 20, 60);
    doc.text(`Semestre Actual: ${currentHistoryStudent.semestre_actual}`, 20, 70);
    
    const calificaciones = demoData.grades.filter(g => g.numero_control === currentHistoryStudent.numero_control);
    
    if (calificaciones.length > 0) {
        let y = 90;
        doc.setFontSize(10);
        doc.text('Materia', 20, y);
        doc.text('Calificacion', 100, y);
        doc.text('Semestre', 140, y);
        
        y += 10;
        calificaciones.forEach(cal => {
            doc.text(cal.materia_nombre, 20, y);
            doc.text(cal.calificacion.toString(), 100, y);
            doc.text(cal.semestre.toString(), 140, y);
            y += 10;
        });
        
        const promedio = (calificaciones.reduce((acc, curr) => acc + parseFloat(curr.calificacion), 0) / calificaciones.length).toFixed(2);
        doc.setFontSize(12);
        doc.text(`Promedio General: ${promedio}`, 20, y + 10);
    }
    
    doc.save(`constancia_${currentHistoryStudent.numero_control}.pdf`);
    showToast('Constancia descargada en PDF', 'success');
}

function descargarConstanciaXLSX() {
    if (!currentHistoryStudent) {
        showToast('No hay historial para descargar', 'error');
        return;
    }
    
    const calificaciones = demoData.grades.filter(g => g.numero_control === currentHistoryStudent.numero_control);
    
    const data = calificaciones.map(cal => ({
        Materia: cal.materia_nombre,
        Calificacion: cal.calificacion,
        Semestre: cal.semestre,
        Parcial: cal.parcial
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial Academico");
    
    XLSX.writeFile(wb, `constancia_${currentHistoryStudent.numero_control}.xlsx`);
    showToast('Constancia descargada en Excel', 'success');
}

// ================= HISTORIAL ACADEMICO =================
function buscarHistorialAcademico() {
    const nc = document.getElementById('history-search-input').value.trim();
    if (!nc) {
        showToast('Ingresa un numero de control', 'error');
        return;
    }
    
    const student = demoData.students.find(s => s.numero_control === nc);
    if (!student) {
        showToast('Alumno no encontrado', 'error');
        document.getElementById('history-result').style.display = 'none';
        return;
    }
    
    currentHistoryStudent = student;
    const calificaciones = demoData.grades.filter(g => g.numero_control === nc);
    
    let html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
            <div><strong>Alumno:</strong> ${student.nombre_completo}</div>
            <div><strong>No. Control:</strong> ${student.numero_control}</div>
            <div><strong>Especialidad:</strong> ${student.especialidad_nombre || 'No asignada'}</div>
            <div><strong>Semestre Actual:</strong> ${student.semestre_actual}</div>
        </div>
    `;
    
    if (calificaciones.length > 0) {
        html += `<h4 style="margin-bottom: 1rem; color: var(--color-primary);">Calificaciones Registradas</h4>
        <table style="width: 100%; margin-bottom: 2rem;">
            <thead>
                <tr>
                    <th>Materia</th>
                    <th>Calificacion</th>
                    <th>Semestre</th>
                    <th>Parcial</th>
                </tr>
            </thead>
            <tbody>`;
        
        calificaciones.forEach(cal => {
            html += `<tr>
                <td>${cal.materia_nombre}</td>
                <td>${cal.calificacion}</td>
                <td>${cal.semestre}</td>
                <td>${cal.parcial}</td>
            </tr>`;
        });
        
        html += `</tbody></table>`;
        
        // Calcular promedio general
        const promedio = (calificaciones.reduce((acc, curr) => acc + parseFloat(curr.calificacion), 0) / calificaciones.length).toFixed(2);
        html += `<div style="text-align: right; font-size: 1.2rem; font-weight: bold; color: var(--color-primary);">
            Promedio General: ${promedio}
        </div>`;
    } else {
        html += `<p style="text-align: center; color: #666;">No hay calificaciones registradas para este alumno</p>`;
    }
    
    document.getElementById('history-content').innerHTML = html;
    document.getElementById('history-result').style.display = 'block';
    showToast('Historial encontrado', 'success');
}

// LOGIN FORMS
async function handleStudentSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');

    const payload = {
        numero_control: formData.get('numero_control'),
        nombre_completo: formData.get('nombre_completo'),
        fecha_nacimiento: formData.get('fecha_nacimiento'),
        email: formData.get('email') || null,
        telefono: formData.get('telefono') || null,
        direccion: formData.get('direccion') || null,
        seccion: formData.get('seccion') || null,
        especialidad_id: formData.get('especialidad_id') || null,
        semestre_actual: Number(formData.get('semestre_actual')) || 1
    };

    try {
        if (id) {
            await apiRequest(`students.php?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            await apiRequest('students.php', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        closeModal('student-modal');
        await loadStudents();
        loadAdminDashboard();
        showToast(id ? 'Alumno actualizado' : 'Alumno agregado', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo guardar el alumno', 'error');
    }
}

async function handleTeacherSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');

    const payload = {
        nombre_completo: formData.get('nombre_completo'),
        email: formData.get('email') || null,
        telefono: formData.get('telefono') || null,
        especialidad: formData.get('especialidad') || null,
        horario_disponibilidad: formData.get('horario_disponibilidad') || null
    };

    try {
        if (id) {
            await apiRequest(`teachers.php?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            await apiRequest('teachers.php', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        closeModal('teacher-modal');
        await loadTeachers();
        loadAdminDashboard();
        showToast(id ? 'Docente actualizado' : 'Docente agregado', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo guardar el docente', 'error');
    }
}

async function handleGradeSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const payload = {
        alumno_id: Number(formData.get('alumno_id')),
        materia_id: Number(formData.get('materia_id')),
        docente_id: formData.get('docente_id') ? Number(formData.get('docente_id')) : null,
        calificacion: Number(formData.get('calificacion')),
        semestre: Number(formData.get('semestre')),
        parcial: Number(formData.get('parcial'))
    };

    try {
        await apiRequest('grades.php', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        closeModal('grade-modal');
        await loadGrades();
        showToast('Calificacion registrada', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo registrar la calificacion', 'error');
    }
}

async function handleEventSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');

    const payload = {
        titulo: formData.get('titulo'),
        descripcion: formData.get('descripcion') || null,
        fecha_evento: formData.get('fecha_evento'),
        hora_evento: formData.get('hora_evento') || null,
        lugar: formData.get('lugar') || null,
        tipo: formData.get('tipo') || 'otro'
    };

    if (currentFlyerBase64) {
        payload.flyer = currentFlyerBase64;
    }

    try {
        if (id) {
            await apiRequest(`events.php?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } else {
            await apiRequest('events.php', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        closeModal('event-modal');
        await loadEvents();
        loadAdminDashboard();
        showToast(id ? 'Evento actualizado' : 'Evento creado', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo guardar el evento', 'error');
    }
}

async function handleStudentAppointmentSubmit(e) {
    e.preventDefault();
    
    if (!currentStudent) {
        showToast('Error: No hay sesion de estudiante activa', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const payload = {
        docente_id: Number(formData.get('docente_id')),
        fecha_cita: formData.get('fecha_cita'),
        hora_cita: formData.get('hora_cita'),
        motivo: formData.get('motivo') || '',
        estado: 'espera'
    };

    if (currentStudent.id) {
        payload.alumno_id = Number(currentStudent.id);
    } else if (currentStudent.numero_control) {
        payload.numero_control = currentStudent.numero_control;
    }

    try {
        await apiRequest('appointments.php', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        closeModal('student-appointment-modal');
        await loadAppointments();
        loadStudentAppointments();
        loadAdminDashboard();
        showToast('Cita agendada correctamente', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo agendar la cita', 'error');
    }
}

async function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const id = formData.get('id');

    try {
        if (id) {
            await apiRequest(`appointments.php?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    estado: formData.get('estado') || 'espera'
                })
            });
        } else {
            await apiRequest('appointments.php', {
                method: 'POST',
                body: JSON.stringify({
                    alumno_id: Number(formData.get('alumno_id')),
                    docente_id: formData.get('docente_id') ? Number(formData.get('docente_id')) : null,
                    fecha_cita: formData.get('fecha_cita'),
                    hora_cita: formData.get('hora_cita'),
                    motivo: formData.get('motivo') || '',
                    estado: formData.get('estado') || 'espera'
                })
            });
        }

        closeModal('appointment-modal');
        await loadAppointments();
        loadAdminDashboard();
        showToast(id ? 'Cita actualizada correctamente' : 'Cita agendada correctamente', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo guardar la cita', 'error');
    }
}

document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const usuarioIngresado = (formData.get('usuario') || '').trim();
    const passwordIngresado = String(formData.get('password') || '');

    if (usuarioIngresado !== 'Admin123' || passwordIngresado !== '1234') {
        showToast('Credenciales incorrectas', 'error');
        return;
    }

    const payload = {
        usuario: usuarioIngresado,
        password: passwordIngresado
    };

    try {
        const response = await apiRequest('admin_login.php', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        currentUser = {
            id: response.user.id,
            nombre: response.user.nombre,
            rol: 'admin'
        };

        document.getElementById('admin-name').textContent = currentUser.nombre;
        showPage('admin-dashboard');
        await loadStudents();
        await loadTeachers();
        await loadGrades();
        await loadEvents();
        await loadAppointments();
        await loadSpecialties();
        loadAdminDashboard();
        showToast('Bienvenido ' + currentUser.nombre, 'success');
    } catch (error) {
        showToast(error.message || 'Credenciales incorrectas', 'error');
    }
});

document.getElementById('student-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const payload = {
        numero_control: formData.get('numero_control'),
        fecha_nacimiento: formData.get('fecha_nacimiento')
    };

    try {
        const response = await apiRequest('student_login.php', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const student = response.student;
        currentStudent = {
            id: student.id,
            nombre: student.nombre_completo,
            numero_control: student.numero_control,
            especialidad: student.especialidad_nombre,
            semestre: student.semestre_actual,
            fecha_nacimiento: student.fecha_nacimiento,
            email: student.email || '',
            telefono: student.telefono || ''
        };

        await loadStudents();
        await loadTeachers();
        await loadGrades();
        await loadEvents();
        await loadAppointments();
        await loadSpecialties();

        refreshStudentProfileUI();
        showPage('student-dashboard');
        showToast('Bienvenido ' + currentStudent.nombre, 'success');
    } catch (error) {
        showToast(error.message || 'Credenciales incorrectas', 'error');
    }
});

function logout() {
    currentUser = null;
    currentStudent = null;
    currentHistoryStudent = null;
    detenerQRLogin();
    showPage('home');
    showToast('Sesion cerrada', 'info');
}

// CARGA DE DATOS
function loadAdminDashboard() {
    document.getElementById('stat-students').textContent = demoData.students.length;
    document.getElementById('stat-teachers').textContent = demoData.teachers.length;
    document.getElementById('stat-events').textContent = demoData.events.length;
    document.getElementById('stat-appointments').textContent = demoData.appointments.filter(a => a.estado === 'pendiente' || a.estado === 'espera').length;
}

async function loadStudents() {
    const tbody = document.querySelector('#students-table tbody');
    tbody.innerHTML = '';

    try {
        const response = await apiRequest('students.php');
        demoData.students = response.data || [];
    } catch (error) {
        showToast('No se pudieron cargar alumnos de la base de datos', 'warning');
    }
    
    demoData.students.forEach(student => {
        tbody.innerHTML += `
            <tr>
                <td>${student.numero_control}</td>
                <td>${student.nombre_completo}</td>
                <td>${student.especialidad_nombre || 'No asignada'}</td>
                <td>${student.seccion || '-'}</td>
                <td>${student.semestre_actual}</td>
                <td>
                    <button class="btn-small btn-edit" onclick="editStudent(${student.id})">Editar</button>
                    <button class="btn-small btn-delete" onclick="deleteStudent(${student.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

async function loadTeachers() {
    const tbody = document.querySelector('#teachers-table tbody');
    tbody.innerHTML = '';

    try {
        const response = await apiRequest('teachers.php');
        demoData.teachers = response.data || [];
    } catch (error) {
        showToast('No se pudieron cargar docentes de la base de datos', 'warning');
    }
    
    demoData.teachers.forEach(teacher => {
        tbody.innerHTML += `
            <tr>
                <td>${teacher.nombre_completo}</td>
                <td>${teacher.especialidad || '-'}</td>
                <td>${teacher.email || '-'}</td>
                <td>${teacher.telefono || '-'}</td>
                <td>
                    <button class="btn-small btn-edit" onclick="editTeacher(${teacher.id})">Editar</button>
                    <button class="btn-small btn-delete" onclick="deleteTeacher(${teacher.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

async function loadGrades() {
    const tbody = document.querySelector('#grades-table tbody');
    tbody.innerHTML = '';

    try {
        const response = await apiRequest('grades.php');
        demoData.grades = response.data || [];
    } catch (error) {
        showToast('No se pudieron cargar calificaciones de la base de datos', 'warning');
    }
    
    demoData.grades.forEach(grade => {
        tbody.innerHTML += `
            <tr>
                <td>${grade.alumno_nombre}</td>
                <td>${grade.numero_control}</td>
                <td>${grade.materia_nombre}</td>
                <td>${grade.calificacion}</td>
                <td>${grade.semestre}</td>
                <td>${grade.parcial}</td>
            </tr>
        `;
    });
}

async function loadEvents() {
    const tbody = document.querySelector('#events-table tbody');
    tbody.innerHTML = '';

    try {
        const response = await apiRequest('events.php');
        demoData.events = response.data || [];
    } catch (error) {
        showToast('No se pudieron cargar eventos de la base de datos', 'warning');
    }
    
    demoData.events.forEach(event => {
        const flyerHtml = event.flyer ? 
            `<img src="${event.flyer}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` : 
            '<span style="color: #999;">Sin flyer</span>';
            
        tbody.innerHTML += `
            <tr>
                <td>${flyerHtml}</td>
                <td>${event.titulo}</td>
                <td>${event.fecha_evento}</td>
                <td>${event.hora_evento || '-'}</td>
                <td>${event.lugar || '-'}</td>
                <td>${event.tipo}</td>
                <td>
                    <button class="btn-small btn-edit" onclick="editEvent(${event.id})">Editar</button>
                    <button class="btn-small btn-delete" onclick="deleteEvent(${event.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

async function loadAppointments() {
    const tbody = document.querySelector('#appointments-table tbody');
    tbody.innerHTML = '';

    try {
        const response = await apiRequest('appointments.php');
        demoData.appointments = response.data || [];
    } catch (error) {
        showToast('No se pudieron cargar citas de la base de datos', 'warning');
    }
    
    demoData.appointments.forEach(appointment => {
        const status = getAppointmentStatusMeta(appointment.estado);

        tbody.innerHTML += `
            <tr>
                <td>${appointment.alumno_nombre}</td>
                <td>${appointment.docente_nombre || 'Sin asignar'}</td>
                <td>${appointment.fecha_cita}</td>
                <td>${appointment.hora_cita}</td>
                <td><span class="appointment-status ${status.className}">${status.label}</span></td>
                <td>
                    <button class="btn-small btn-edit" onclick="editAppointment(${appointment.id})">Editar</button>
                    <button class="btn-small btn-delete" onclick="deleteAppointment(${appointment.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function getAppointmentStatusMeta(estado) {
    const normalized = (estado || '').toLowerCase();
    if (normalized === 'aceptado') {
        return { className: 'status-inprogress', label: 'Aceptado' };
    }
    if (normalized === 'rechazado' || normalized === 'caducado') {
        return { className: 'status-expired', label: 'Rechazado' };
    }
    return { className: 'status-pending', label: 'En espera' };
}

async function loadSpecialties() {
    const tbody = document.querySelector('#specialties-table tbody');
    tbody.innerHTML = '';

    try {
        const response = await apiRequest('specialties.php');
        demoData.specialties = response.data || [];
    } catch (error) {
        showToast('No se pudieron cargar especialidades de la base de datos', 'warning');
    }
    
    demoData.specialties.forEach(specialty => {
        const cuadernillosBtn = specialty.cuadernillos && specialty.cuadernillos.length > 0 ?
            `<button class="btn-small btn-edit" onclick="verCuadernillos(${specialty.id})">Ver (${specialty.cuadernillos.length})</button>` :
            '<span style="color: #999;">-</span>';
            
        const formatosBtn = specialty.formatos && specialty.formatos.length > 0 ?
            `<button class="btn-small btn-edit" onclick="verFormatos(${specialty.id})">Ver (${specialty.formatos.length})</button>` :
            '<span style="color: #999;">-</span>';
            
        tbody.innerHTML += `
            <tr>
                <td>${specialty.nombre}</td>
                <td>${specialty.descripcion || '-'}</td>
                <td>${cuadernillosBtn}</td>
                <td>${formatosBtn}</td>
                <td>
                    <button class="btn-small btn-edit" onclick="editSpecialty(${specialty.id})">Editar</button>
                    <button class="btn-small btn-delete" onclick="deleteSpecialty(${specialty.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// CRUD OPERATIONS
async function deleteStudent(id) {
    if (!confirm('Â¿Estas seguro de eliminar este alumno?')) return;

    try {
        await apiRequest(`students.php?id=${id}`, {
            method: 'DELETE'
        });
        await loadStudents();
        loadAdminDashboard();
        showToast('Alumno eliminado', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo eliminar el alumno', 'error');
    }
}

function editStudent(id) {
    const student = demoData.students.find(s => s.id === id);
    if (student) {
        document.querySelector('#student-form input[name="id"]').value = student.id;
        document.querySelector('#student-form input[name="numero_control"]').value = student.numero_control;
        document.querySelector('#student-form input[name="nombre_completo"]').value = student.nombre_completo;
        document.querySelector('#student-form input[name="fecha_nacimiento"]').value = student.fecha_nacimiento;
        document.querySelector('#student-form input[name="email"]').value = student.email || '';
        document.querySelector('#student-form input[name="telefono"]').value = student.telefono || '';
        document.querySelector('#student-form input[name="direccion"]').value = student.direccion || '';
        document.querySelector('#student-form select[name="seccion"]').value = student.seccion || '';
        document.querySelector('#student-form select[name="especialidad_id"]').value = student.especialidad_id || '';
        document.querySelector('#student-form input[name="semestre_actual"]').value = student.semestre_actual || 1;
        document.getElementById('student-modal-title').textContent = 'Editar Alumno';
        document.getElementById('qr-container').style.display = 'none';
        openModal('student-modal');
    }
}

async function deleteTeacher(id) {
    if (!confirm('Â¿Estas seguro de eliminar este docente?')) return;

    try {
        await apiRequest(`teachers.php?id=${id}`, {
            method: 'DELETE'
        });
        await loadTeachers();
        loadAdminDashboard();
        showToast('Docente eliminado', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo eliminar el docente', 'error');
    }
}

function editTeacher(id) {
    const teacher = demoData.teachers.find(t => t.id === id);
    if (teacher) {
        document.querySelector('#teacher-form input[name="id"]').value = teacher.id;
        document.querySelector('#teacher-form input[name="nombre_completo"]').value = teacher.nombre_completo;
        document.querySelector('#teacher-form input[name="email"]').value = teacher.email || '';
        document.querySelector('#teacher-form input[name="telefono"]').value = teacher.telefono || '';
        document.querySelector('#teacher-form input[name="especialidad"]').value = teacher.especialidad || '';
        document.querySelector('#teacher-form textarea[name="horario_disponibilidad"]').value = teacher.horario_disponibilidad || '';
        document.getElementById('teacher-modal-title').textContent = 'Editar Docente';
        openModal('teacher-modal');
    }
}

async function deleteEvent(id) {
    if (!confirm('Â¿Estas seguro de eliminar este evento?')) return;

    try {
        await apiRequest(`events.php?id=${id}`, {
            method: 'DELETE'
        });
        await loadEvents();
        loadAdminDashboard();
        showToast('Evento eliminado', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo eliminar el evento', 'error');
    }
}

function editEvent(id) {
    const event = demoData.events.find(e => e.id === id);
    if (event) {
        document.querySelector('#event-form input[name="id"]').value = event.id;
        document.querySelector('#event-form input[name="titulo"]').value = event.titulo;
        document.querySelector('#event-form textarea[name="descripcion"]').value = event.descripcion || '';
        document.querySelector('#event-form input[name="fecha_evento"]').value = event.fecha_evento;
        document.querySelector('#event-form input[name="hora_evento"]').value = event.hora_evento || '';
        document.querySelector('#event-form input[name="lugar"]').value = event.lugar || '';
        document.querySelector('#event-form select[name="tipo"]').value = event.tipo;
        
        if (event.flyer) {
            document.getElementById('flyer-img-preview').src = event.flyer;
            document.getElementById('flyer-preview').style.display = 'block';
            currentFlyerBase64 = event.flyer;
        }
        
        document.getElementById('event-modal-title').textContent = 'Editar Evento';
        openModal('event-modal');
    }
}

function editAppointment(id) {
    const appointment = demoData.appointments.find(a => a.id === id);
    if (!appointment) return;

    loadStudentsSelectForAppointment();
    loadTeachersSelectForAppointmentAdmin();
    const normalizedState = (appointment.estado || '').toLowerCase();

    document.getElementById('appointment-id').value = appointment.id;
    document.getElementById('appointment-student-select').value = appointment.alumno_id || '';
    document.getElementById('appointment-teacher-select-admin').value = appointment.docente_id || '';
    document.querySelector('#appointment-form input[name="fecha_cita"]').value = appointment.fecha_cita || '';
    document.querySelector('#appointment-form input[name="hora_cita"]').value = appointment.hora_cita || '';
    document.querySelector('#appointment-form textarea[name="motivo"]').value = appointment.motivo || '';
    document.getElementById('appointment-status-select').value =
        normalizedState === 'aceptado' || normalizedState === 'rechazado' ? normalizedState : 'espera';
    document.getElementById('appointment-modal-title').textContent = 'Editar Cita (Solo Estado)';
    document.getElementById('appointment-submit-btn').textContent = 'Guardar cambios';
    setAppointmentEditMode(true);

    openModal('appointment-modal');
}

function setAppointmentEditMode(isEditMode) {
    document.getElementById('appointment-student-select').disabled = isEditMode;
    document.getElementById('appointment-teacher-select-admin').disabled = isEditMode;
    document.querySelector('#appointment-form input[name="fecha_cita"]').disabled = isEditMode;
    document.querySelector('#appointment-form input[name="hora_cita"]').disabled = isEditMode;
    document.querySelector('#appointment-form textarea[name="motivo"]').disabled = isEditMode;

    document.getElementById('group-appointment-student').style.display = isEditMode ? 'none' : '';
    document.getElementById('group-appointment-teacher').style.display = isEditMode ? 'none' : '';
    document.getElementById('group-appointment-date').style.display = isEditMode ? 'none' : '';
    document.getElementById('group-appointment-time').style.display = isEditMode ? 'none' : '';
    document.getElementById('group-appointment-reason').style.display = isEditMode ? 'none' : '';
}

async function deleteAppointment(id) {
    if (!confirm('Â¿Estas seguro de eliminar esta cita?')) return;

    try {
        await apiRequest(`appointments.php?id=${id}`, {
            method: 'DELETE'
        });
        await loadAppointments();
        if (currentStudent) loadStudentAppointments();
        loadAdminDashboard();
        showToast('Cita eliminada', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo eliminar la cita', 'error');
    }
}

async function deleteSpecialty(id) {
    if (!confirm('Â¿Estas seguro de eliminar esta especialidad?')) return;

    try {
        await apiRequest(`specialties.php?id=${id}`, {
            method: 'DELETE'
        });
        await loadSpecialties();
        if (currentStudent) loadStudentSpecialtyResources();
        showToast('Especialidad eliminada', 'success');
    } catch (error) {
        showToast(error.message || 'No se pudo eliminar la especialidad', 'error');
    }
}

function editSpecialty(id) {
    const specialty = demoData.specialties.find(s => s.id === id);
    if (specialty) {
        currentEditingSpecialty = specialty;
        document.getElementById('specialty-id').value = specialty.id;
        document.getElementById('specialty-nombre').value = specialty.nombre;
        document.getElementById('specialty-descripcion').value = specialty.descripcion || '';
        document.getElementById('specialty-modal-title').textContent = 'Editar Especialidad';

        openModal('specialty-modal');
    }
}

function verCuadernillos(id) {
    const specialty = demoData.specialties.find(s => s.id === id);
    if (specialty && specialty.cuadernillos.length > 0) {
        showToast(`Especialidad con ${specialty.cuadernillos.length} cuadernillos`, 'info');
    }
}

function verFormatos(id) {
    const specialty = demoData.specialties.find(s => s.id === id);
    if (specialty && specialty.formatos.length > 0) {
        showToast(`Especialidad con ${specialty.formatos.length} formatos`, 'info');
    }
}

// SELECTS AUXILIARES
function loadStudentsSelect() {
    const select = document.getElementById('grade-student-select');
    select.innerHTML = '<option value="">Seleccionar alumno...</option>';
    demoData.students.forEach(student => {
        select.innerHTML += `<option value="${student.id}">${student.numero_control} - ${student.nombre_completo}</option>`;
    });
}

function loadTeachersSelect() {
    const select = document.getElementById('grade-teacher-select');
    select.innerHTML = '<option value="">Seleccionar docente...</option>';
    demoData.teachers.forEach(teacher => {
        select.innerHTML += `<option value="${teacher.id}">${teacher.nombre_completo}</option>`;
    });
}

async function loadSubjectsSelect(selectId = 'grade-subject-select') {
    const select = document.getElementById(selectId);
    if (!select) return;

    try {
        const response = await apiRequest('subjects.php');
        const subjects = response.data || [];
        select.innerHTML = '<option value="">Seleccionar materia...</option>';
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        showToast('No se pudieron cargar materias de la base de datos', 'warning');
    }
}

function loadTeachersSelectForAppointment() {
    const select = document.getElementById('appointment-teacher-select');
    select.innerHTML = '<option value="">Seleccionar docente...</option>';
    demoData.teachers.forEach(teacher => {
        select.innerHTML += `<option value="${teacher.id}">${teacher.nombre_completo} - ${teacher.especialidad || ''}</option>`;
    });
}

function loadStudentsSelectForAppointment() {
    const select = document.getElementById('appointment-student-select');
    select.innerHTML = '<option value="">Seleccionar alumno...</option>';
    demoData.students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.nombre_completo} (${student.numero_control})`;
        select.appendChild(option);
    });
}

function loadTeachersSelectForAppointmentAdmin() {
    const select = document.getElementById('appointment-teacher-select-admin');
    select.innerHTML = '<option value="">Seleccionar docente...</option>';
    demoData.teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.nombre_completo;
        select.appendChild(option);
    });
}

// PORTAL ESTUDIANTE
function loadStudentDashboard() {
    loadStudentGrades();
    loadStudentSpecialtyResources();
    loadStudentEvents();
    loadStudentAppointments();
}

function normalizeSpecialtyFile(file) {
    if (!file) return null;
    if (typeof file === 'string') return { name: file, url: '' };
    return { name: file.name || 'Archivo', url: file.url || '' };
}

function getStudentSpecialtyRecord() {
    if (!currentStudent || !currentStudent.especialidad) return null;
    return demoData.specialties.find(s => s.nombre === currentStudent.especialidad) || null;
}

function descargarRecursoEspecialidad(tipo, index) {
    const specialty = getStudentSpecialtyRecord();
    if (!specialty) {
        showToast('No se encontro la especialidad del estudiante', 'error');
        return;
    }

    const source = tipo === 'cuadernillos' ? specialty.cuadernillos : specialty.formatos;
    const resource = normalizeSpecialtyFile(source[index]);
    if (!resource) {
        showToast('No se encontro el recurso solicitado', 'error');
        return;
    }

    if (resource.url) {
        const anchor = document.createElement('a');
        anchor.href = resource.url;
        anchor.download = resource.name;
        anchor.click();
        return;
    }

    showToast('Este recurso no tiene archivo adjunto para descarga', 'warning');
}

function renderSpecialtyResourcesList(containerId, resources, tipo) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const normalized = (resources || []).map(normalizeSpecialtyFile).filter(Boolean);
    if (normalized.length === 0) {
        container.innerHTML = '<p style="color:#6b7280;">No hay archivos disponibles.</p>';
        return;
    }

    container.innerHTML = normalized.map((item, index) => `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:0.6rem;">
            <span style="word-break:break-word;">${item.name}</span>
            <button class="btn-small btn-edit" onclick="descargarRecursoEspecialidad('${tipo}', ${index})">Descargar</button>
        </div>
    `).join('');
}

async function loadStudentSpecialtyResources() {
    const nameEl = document.getElementById('student-specialty-name');
    const descEl = document.getElementById('student-specialty-description');
    if (!nameEl || !descEl) return;

    if (!demoData.specialties || demoData.specialties.length === 0) {
        await loadSpecialties();
    }

    const specialty = getStudentSpecialtyRecord();
    if (!specialty) {
        nameEl.textContent = currentStudent && currentStudent.especialidad ? currentStudent.especialidad : 'No asignada';
        descEl.textContent = 'No se encontro informacion de esta especialidad.';
        renderSpecialtyResourcesList('student-specialty-books', [], 'cuadernillos');
        renderSpecialtyResourcesList('student-specialty-formats', [], 'formatos');
        return;
    }

    nameEl.textContent = specialty.nombre;
    descEl.textContent = specialty.descripcion || 'Sin descripcion disponible.';
    renderSpecialtyResourcesList('student-specialty-books', specialty.cuadernillos || [], 'cuadernillos');
    renderSpecialtyResourcesList('student-specialty-formats', specialty.formatos || [], 'formatos');
}

// Agregar al dashboard de estudiante
function loadAcademicProgress() {
    if (!currentStudent) return '';

    const grades = demoData.grades.filter(g => g.numero_control === currentStudent.numero_control);
    if (grades.length === 0) {
        return '<p style="text-align:center; color:#666; margin-bottom:1rem;">Sin calificaciones para calcular promedio</p>';
    }

    const avg = grades.reduce((acc, g) => acc + g.calificacion, 0) / grades.length;

    return `
        <div class="progress-ring">
            <svg viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="#eee" stroke-width="3"/>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="${avg >= 8 ? '#27ae60' : avg >= 6 ? '#f39c12' : '#e74c3c'}"
                      stroke-width="3" stroke-dasharray="${avg * 10}, 100"/>
            </svg>
            <div class="progress-text">${avg.toFixed(1)}</div>
        </div>
    `;
}

function loadStudentGrades() {
    if (!currentStudent) return;
    
    const progressContainer = document.getElementById('student-academic-progress');
    const tbody = document.querySelector('#student-grades-table tbody');
    if (progressContainer) {
        progressContainer.innerHTML = loadAcademicProgress();
    }
    tbody.innerHTML = '';
    
    const studentGrades = demoData.grades.filter(g => g.numero_control === currentStudent.numero_control);
    
    if (studentGrades.length > 0) {
        studentGrades.forEach(grade => {
            tbody.innerHTML += `
                <tr>
                    <td>${grade.materia_nombre}</td>
                    <td>Profesor Asignado</td>
                    <td>${grade.calificacion}</td>
                    <td>${grade.semestre}</td>
                    <td>${grade.parcial}</td>
                </tr>
            `;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No tienes calificaciones registradas</td></tr>';
    }
}

function loadStudentEvents() {
    const container = document.getElementById('student-events-container');
    container.innerHTML = '';
    
    demoData.events.forEach(event => {
        const flyerHtml = event.flyer ? 
            `<img src="${event.flyer}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px 8px 0 0;">` :
            `<div style="width: 100%; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 8px 8px 0 0; color: #999;">Sin imagen</div>`;
            
        container.innerHTML += `
            <div class="event-card">
                ${flyerHtml}
                <div style="padding: 1.5rem;">
                    <h3 style="margin-bottom: 0.5rem; color: var(--color-primary);">${event.titulo}</h3>
                    <p style="color: #666; margin-bottom: 0.5rem;"><strong>Fecha:</strong> ${event.fecha_evento}</p>
                    <p style="color: #666; margin-bottom: 0.5rem;"><strong>Hora:</strong> ${event.hora_evento || 'Por definir'}</p>
                    <p style="color: #666; margin-bottom: 0.5rem;"><strong>Lugar:</strong> ${event.lugar || 'Por definir'}</p>
                    <span style="display: inline-block; padding: 0.25rem 0.75rem; background: var(--color-primary); color: white; border-radius: 20px; font-size: 0.875rem; text-transform: uppercase;">${event.tipo}</span>
                </div>
            </div>
        `;
    });
}

function loadStudentAppointments() {
    if (!currentStudent) return;
    
    const tbody = document.querySelector('#student-appointments-table tbody');
    tbody.innerHTML = '';
    
    const studentAppointments = demoData.appointments.filter(a =>
        (a.alumno_id && Number(a.alumno_id) === Number(currentStudent.id)) ||
        a.alumno_nombre === currentStudent.nombre
    );
    
    if (studentAppointments.length > 0) {
        studentAppointments.forEach(appointment => {
            const status = getAppointmentStatusMeta(appointment.estado);
            tbody.innerHTML += `
                <tr>
                    <td>${appointment.docente_nombre || 'Sin asignar'}</td>
                    <td>${appointment.fecha_cita}</td>
                    <td>${appointment.hora_cita}</td>
                    <td><span class="appointment-status ${status.className}">${status.label}</span></td>
                    <td>
                        <button class="btn-small btn-delete" onclick="deleteAppointment(${appointment.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No tienes citas agendadas</td></tr>';
    }
}

// INICIALIZACION
document.addEventListener('DOMContentLoaded', () => {
    const savedCalificaciones = localStorage.getItem("calificacionesExcel");
    if (savedCalificaciones) {
        calificacionesExcel = JSON.parse(savedCalificaciones);
    }
    updateProfileEditButtonVisibility();
    
    console.log('SIEA Demo cargado exitosamente');
    console.log('Datos de demo disponibles:', demoData);
    console.log('Credenciales de prueba:');
    console.log('   Admin: cualquier usuario/contraseÃ±a');
    console.log('   Estudiante: 2024001 / 2005-03-15');
});