
let currentIndex = 0;
const carousel = document.querySelector('.carousel');
const retour = document.querySelector('.carousel-button.prev');
const avance = document.querySelector('.carousel-button.next');
const icon = document.getElementsByTagName('i');
const addMediaButton = document.getElementById('addMediaButton');
const uploadFileInput = document.getElementById('uploadFile');
const mediaFormatSelect = document.getElementById('mediaFormat');
const errorMessage = document.getElementById('errorMessage');
const replaceFileInput = document.getElementById('replaceFileInput');
const replaceMediaButton = document.getElementById('replaceMediaButton');
const cancelButton = document.querySelector('#replaceCancelButton');
const addCancelButton = document.querySelector('#addCancelButton');
const finishButton=document.getElementById('finishButton');

 const { createFFmpeg, fetchFile } = FFmpeg;
 const ffmpeg = createFFmpeg({ log: true,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js', 
    wasmPath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.wasm',
    useWorker: false, // Empêche l'utilisation de SharedArrayBuffer});
});



//Variable auto-scroll
let autoScrollInterval = null;

// Variables pour la modal 
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteButton = document.getElementById('confirmDelete');
const cancelDeleteButton = document.getElementById('cancelDelete');

// Variables pour la modal finish
const finishModal = document.getElementById('finishModal');
const confirmFinishButton = document.getElementById('confirmFinish');
const cancelFinishButton = document.getElementById('cancelFinish');

let mediaToDelete = null; // Stocke temporairement l'élément à supprimer
let mediaToReplace = null; // Stocke temporairement l'élément à remplacer

cancelButton.style.display = 'none';

// Fonction pour afficher la modal de confirmation
function showModal() {
    deleteModal.style.display = 'flex'; // Afficher la modal
    
}

function showModalFinish() {
    finishModal.style.display = 'flex'; // Afficher la modal
    
}
function enableAllInputs() {
    const allInputs = document.querySelectorAll('input, select, button');
    allInputs.forEach(input => {
        input.disabled = false; // Réactiver l'input
    });
}


// Fonction pour masquer la modal de confirmation
function hideModal() {
    deleteModal.style.display = 'none'; // Cacher la modal
}
function hideFinishModal() {
    finishModal.style.display = 'none'; // Cacher la modal
}

// Fonction pour gérer la confirmation de suppression
confirmDeleteButton.addEventListener('click', () => {
    if (mediaToDelete) {
        carousel.removeChild(mediaToDelete); // Supprimer l'élément du carrousel
        mediaToDelete = null; // Réinitialiser
        //reinitialise les options disponiples du mediaFormatSelect
        const options = mediaFormatSelect.querySelectorAll('option')
        options.forEach(option => {
            option.disabled = false; // Réactiver les options
        });

    }
    
    // Réinitialiser le message d'erreur
    hideModal(); // Cacher la modal après la suppression
    
      
});

// Fonction pour gérer l'annulation de la suppression
cancelDeleteButton.addEventListener('click', () => {
    mediaToDelete = null; // Réinitialiser si l'utilisateur annule
    hideModal(); // Cacher la modal
});

// Fonction pour afficher la boîte de dialogue de remplacement
function showReplaceDialog(item) {
    mediaToReplace = item; // Stocker l'élément à remplacer
    replaceFileInput.style.display = 'block'; // Afficher le champ de fichier pour remplacement
    replaceMediaButton.style.display = 'block'; // Afficher le bouton de remplacement
    cancelButton.style.display = 'block'; // Afficher le bouton annuller

}
function hideReplaceDialog() {
    replaceFileInput.style.display = 'none'; // Cacher le champ de fichier pour remplacement
    replaceMediaButton.style.display = 'none'; // Cacher le bouton de remplacement
    cancelButton.style.display = 'none'; // Cacher le bouton annuller
}

// Fonction pour configurer les événements de clic sur les médias
function setupMediaClickListener() {
    const items = document.querySelectorAll('.carousel-item');
    items.forEach(item => {
        // Ajout de l'événement de clic pour la suppression
        const deleteIcon = item.querySelector('.fa-trash');
        deleteIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            mediaToDelete = item; // Stocker l'élément à supprimer
            showModal(); // Afficher la modal de confirmation
        });

        // Ajout de l'événement de clic pour la modification
        const editIcon = item.querySelector('.fa-edit');
        if (!editIcon) {
            // Si l'icône de modification n'existe pas, ajoutez-la
            const newEditIcon = document.createElement('i');
            newEditIcon.classList.add('fa-solid', 'fa-edit', 'edit-icon');
            item.appendChild(newEditIcon);
            newEditIcon.addEventListener('click', () => {
                showReplaceDialog(item); // Afficher la boîte de dialogue de remplacement
            });
        }
    });
}
// Définir les extensions autorisées
const allowedFormats = {
    image: ['jpg', 'jpeg', 'png', 'gif'],
    video: ['mp4', 'mov'],
    square: ['jpg', 'jpeg', 'png']
};

// Fonction pour vérifier l'extension du fichier
function isValidFile(file, format) {
    const extension = file.name.split('.').pop().toLowerCase();
    return allowedFormats[format].includes(extension);
}

// Fonction pour ajouter des médias au carrousel
function addMediaToCarousel(files, format) {

    let mediaAdded = false;
  


    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileURL = URL.createObjectURL(file);

        if (!isValidFile(file, format)) {
            displayError(`Veuillez sélectionner un fichier au format ${format === 'video' ? 'vidéo' : format === 'square' ? 'image carrée' : 'image'}.`);
            continue;
        }

        let mediaElement;

        if (format === 'image' || format === 'square') {
            mediaElement = document.createElement('img');
            mediaElement.src = fileURL;
        } else if (format === 'video') {
            mediaElement = document.createElement('video');
            mediaElement.src = fileURL;
            mediaElement.controls = true;
        }

        const newItem = document.createElement('div');
        newItem.classList.add('carousel-item');
        if (format === 'square') {
            newItem.classList.add('square');
        }

        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fa-solid', 'fa-trash', 'delete-icon');
        deleteIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            mediaToDelete = newItem;
            showModal();
            
        });

        const editIcon = document.createElement('i');
        editIcon.classList.add('fa-solid', 'fa-edit', 'edit-icon');
        editIcon.addEventListener('click', () => {
            showReplaceDialog(newItem);
            retour.style.display = 'none';
            avance.style.display = 'none';
            editIcon.style.display = 'none';
            deleteIcon.style.display = 'none';
           
            const Container = document.querySelector('.container');
            Container.style.marginTop = '14vh';

            const defilContainer = document.querySelector('#defil-container');
            defilContainer.style.position = 'relative';
            defilContainer.style.bottom = '12.2vh';



           

            document.getElementById('replaceFileInput').classList.add('active');
            document.getElementById('replaceMediaButton').classList.add('active');

       

            const allInputs = document.querySelectorAll('input, select, button');
            allInputs.forEach(input => {
                if (input !== replaceFileInput && input !== replaceMediaButton && input !== cancelButton) {
                    input.disabled = true; // Désactiver l'input
                    cancelButton.style.cursor = 'pointer';    
                }
            });
            
        });

        newItem.appendChild(mediaElement);
        newItem.appendChild(deleteIcon);
        newItem.appendChild(editIcon);
        carousel.appendChild(newItem);
        mediaAdded = true;
    }

    if (mediaAdded) {
        updateCarousel();
        uploadFileInput.value = ''; // Réinitialiser le champ d'upload après l'ajout
        updateFormatOptions(); // Mettre à jour les options du sélecteur
        resetFormatSelect(); // Réinitialiser le sélecteur au choix par défaut
        setupMediaClickListener();

        if (autoScrollInterval) {
            const editIcons = document.querySelectorAll('.edit-icon');
            const deleteIcons = document.querySelectorAll('.delete-icon');
            
            editIcons.forEach(icon => {
                icon.style.display = 'none';
            });
            deleteIcons.forEach(icon => {
                icon.style.display = 'none';
            });
        }
      //finishButton.style.display = 'block';
    }
}

// Fonction pour remplacer un média existant
function replaceMedia() {
    if (mediaToReplace && replaceFileInput.files.length > 0) {
        const file = replaceFileInput.files[0];
        const fileURL = URL.createObjectURL(file);

        if (mediaToReplace.querySelector('img')) {
            const imgElement = mediaToReplace.querySelector('img');
            imgElement.src = fileURL;
            
        } else if (mediaToReplace.querySelector('video')) {
            const videoElement = mediaToReplace.querySelector('video');
            videoElement.src = fileURL;
        }

        replaceFileInput.value = ''; // Réinitialiser le champ de fichier après le remplacement
        replaceFileInput.style.display = 'none'; // Cacher le champ de fichier
        replaceMediaButton.style.display = 'none'; // Cacher le bouton de remplacement
        mediaToReplace = null; // Réinitialiser l'élément à remplacer
        retour.style.display = 'block';
        avance.style.display = 'block';
        //reactiver les inputs
         enableAllInputs();
        //reafficher edit-icon et trash-icon
        const editIcon = document.querySelector('.edit-icon');
        editIcon.style.display = 'block';
        const deleteIcon = document.querySelector('.delete-icon');
        deleteIcon.style.display = 'block';

        const defilContainer = document.querySelector('#defil-container');
        defilContainer.style.bottom = '0';
        cancelButton.style.display = 'none';
 
    }
    
}

// Fonction pour afficher un message d'erreur
function displayError(message) {
    errorMessage.textContent = message;
}

// Fonction pour mettre à jour le carrousel
function updateCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    if (items.length > 0) {
        const translateX = -currentIndex * 100;
        carousel.style.transform = `translateX(${translateX}%)`;

        items.forEach(item => {
            item.classList.remove('active');
        });

        // Ajouter la classe active au slide courant
        items[currentIndex].classList.add('active');
        
    }
    if(items.length>1){
        finishButton.style.display = 'block';
    }
}

// Fonction pour passer à l'image suivante
function goToNextSlide() {
    const items = document.querySelectorAll('.carousel-item');
    currentIndex = (currentIndex + 1) % items.length; // Boucle infinie
    updateCarousel();
}

// Fonction pour démarrer le défilement automatique
// Fonction pour démarrer le défilement automatique
function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
        goToNextSlide(); // Passer à la diapositive suivante

        // Vérifier si la diapositive courante contient une vidéo et la jouer
        const currentSlide = document.querySelector('.carousel-item.active video');
        if (currentSlide) {
            currentSlide.muted = true; // Mute la vidéo
            currentSlide.play(); // Démarrer la vidéo   
        }

    }, 3000);
   


 
  
    const editIcons = document.querySelectorAll('.edit-icon');
    const deleteIcons = document.querySelectorAll('.delete-icon');
    
    // Masquer toutes les icônes d'édition et de suppression
    if (editIcons.length > 0) {
        editIcons.forEach(icon => {
            icon.style.display = 'none';
        });
    }
    if (deleteIcons.length > 0) {
        deleteIcons.forEach(icon => {
            icon.style.display = 'none';
        });
    }
}

// Fonction pour arrêter le défilement automatique
function stopAutoScroll() {
    clearInterval(autoScrollInterval);

    const editIcons = document.querySelectorAll('.edit-icon');
    const deleteIcons = document.querySelectorAll('.delete-icon');
    
    // Réafficher toutes les icônes d'édition et de suppression
    if (editIcons.length > 0) {
        editIcons.forEach(icon => {
            icon.style.display = 'block';
        });
    }
    if (deleteIcons.length > 0) {
        deleteIcons.forEach(icon => {
            icon.style.display = 'block';
        });
    }
//Lorsque le scroll est sur non les medias vidéos sont en pause et remis à zero
    const videos = document.querySelectorAll('.carousel-item video');
    if (videos.length > 0) {
        videos.forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
    }

}


// Fonction pour gérer le changement dans le sélecteur de défilement automatique
autoScrollSelect.addEventListener('change', () => {
    const autoScrollValue = autoScrollSelect.value;

    if (autoScrollValue === 'yes') {
        startAutoScroll();
        
    } else if (autoScrollValue === 'no') {
        stopAutoScroll();
       
    }
});

// Fonction pour naviguer dans le carrousel
function moveCarousel(direction) {
    const items = document.querySelectorAll('.carousel-item');
    if (items.length > 0) {
        currentIndex += direction;
        if (currentIndex < 0) {
            currentIndex = items.length - 1;
        } else if (currentIndex >= items.length) {
            currentIndex = 0;
        }
        updateCarousel();
      
    }
}



// Fonction pour mettre à jour les options du sélecteur
function updateFormatOptions() {
    const selectedFormat = mediaFormatSelect.value;
    const options = mediaFormatSelect.querySelectorAll('option');

    if (selectedFormat === 'square') {
        options.forEach(option => {
            if (option.value === 'image') {
                option.disabled = true;
                option.classList.add('disabled-option');
                option.textContent += ' (Désactivé)';
            }
        });
    } else if (selectedFormat === 'image' || selectedFormat) {
        enableImageFormats();
    }
}

// Fonction pour réactiver les formats d'image
function enableImageFormats() {
    const options = mediaFormatSelect.querySelectorAll('option');
    options.forEach(option => {
        if (option.value === 'image') {
            option.disabled = false;
            option.classList.remove('disabled-option');
            option.textContent = option.textContent.replace(' (Désactivé)', '');
        }
        if (option.value === 'square') {
            option.disabled = true;
            option.classList.remove('disabled-option');
            option.textContent = option.textContent.replace(' (Désactivé)', '');
        }
    });
}



// Fonction pour réinitialiser le sélecteur au choix par défaut
function resetFormatSelect() {
    mediaFormatSelect.selectedIndex = 0;
}









// Gestion du bouton d'ajout de médias
addMediaButton.addEventListener('click', () => {
    const files = uploadFileInput.files;
    const format = mediaFormatSelect.value;

    if (files.length > 0) {
        displayError('');
        addMediaToCarousel(files, format);
    }
});


async function createVideoFromCarousel() {
    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    const items = document.querySelectorAll('.carousel-item');
    const fps = 15;
    const videoWidth = 1280;
    const videoHeight = 720;
    const itemDuration = 1.5; // Durée par média réduite

    let fileIndex = 0;
    const inputs = [];

    for (const item of items) {
        const mediaElement = item.querySelector('img, video');
        const mediaType = mediaElement.tagName.toLowerCase();
        const mediaSrc = mediaElement.src;

        if (mediaType === 'img') {
            const imageBlob = await fetch(mediaSrc).then(r => r.blob());
            const imageFile = new Uint8Array(await imageBlob.arrayBuffer());
            const imageFileName = `image${fileIndex}.jpg`;

            ffmpeg.FS('writeFile', imageFileName, imageFile);
            await ffmpeg.run(
                '-loop', '1', '-t', itemDuration.toString(), '-i', imageFileName,
                '-vf', `scale=${videoWidth}:${videoHeight},format=yuv420p`,
                '-c:v', 'libx264', '-crf', '30', '-preset', 'ultrafast',
                `scroll_image_${fileIndex}.mp4`
            );
            inputs.push(`scroll_image_${fileIndex}.mp4`);
        } else if (mediaType === 'video') {
            const videoBlob = await fetch(mediaSrc).then(r => r.blob());
            const videoFile = new Uint8Array(await videoBlob.arrayBuffer());
            const videoFileName = `video${fileIndex}.mp4`;

            ffmpeg.FS('writeFile', videoFileName, videoFile);
            await ffmpeg.run(
                '-i', videoFileName, '-vf', `scale=${videoWidth}:${videoHeight},format=yuv420p`,
                '-crf', '30', '-preset', 'ultrafast',
                `scroll_video_${fileIndex}.mp4`
            );
            inputs.push(`scroll_video_${fileIndex}.mp4`);
        }
        fileIndex++;
    }

    const inputFileList = inputs.map(input => `file '${input}'`).join('\n');
    ffmpeg.FS('writeFile', 'input.txt', new TextEncoder().encode(inputFileList));

    await ffmpeg.run(
        '-f', 'concat', '-safe', '0', '-i', 'input.txt',
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'ultrafast',
        'carousel_scroll_optimized.mp4'
    );

    const data = ffmpeg.FS('readFile', 'carousel_scroll_optimized.mp4');
    const videoURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    const a = document.createElement('a');
    a.href = videoURL;
    a.download = 'carousel-scroll-linkedin.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert('Vidéo optimisée générée pour LinkedIn!');
}








//si je clique #cancelButton alors la value de l'input #replaceMediaInput sera vide
cancelButton.addEventListener('click', () => {
    replaceFileInput.value = '';

    const editIcon = document.querySelector('.edit-icon');
    const deleteIcon = document.querySelector('.delete-icon');

    editIcon.style.display = 'block';
    deleteIcon.style.display = 'block';

    enableAllInputs();

    hideReplaceDialog();
    
    const defilContainer = document.querySelector('#defil-container');
    defilContainer.style.bottom = '0';

});

addCancelButton.addEventListener('click', () => {

    uploadFileInput.value = '';
    mediaFormatSelect.selectedIndex = 0;
    console.log('cancel button clicked');
});

document.getElementById('finishButton').addEventListener('click', function() {
    showModalFinish();
    // Ajoute ici d'autres actions que tu veux effectuer lorsque l'utilisateur clique sur "J'ai fini".
});
confirmFinishButton.addEventListener('click', () => {
  
    finishModal.style.display = 'none'; // Fermer la modale
    createVideoFromCarousel(); // Appel de la fonction pour créer la vidéo
   
      
});

// Fonction pour gérer l'annulation de la suppression
cancelFinishButton.addEventListener('click', () => {
  hideFinishModal();
});

// Gestion du bouton de remplacement de médias
replaceMediaButton.addEventListener('click', replaceMedia);

// Gestion des boutons de navigation
document.querySelector('.carousel-button.prev').addEventListener('click', () => moveCarousel(-1));
document.querySelector('.carousel-button.next').addEventListener('click', () => moveCarousel(1));

// Initialisation de l'intitulé du sélecteur
function updateSelectPlaceholder() {
    mediaFormatSelect.selectedIndex = 0;
}
updateSelectPlaceholder();

