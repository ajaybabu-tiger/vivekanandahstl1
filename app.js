/* =========================================================================
   Vivekananda Boys Hostel - Core Client Logic
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------------------------------------
       1. Mobile Navigation Menu Drawer
       ------------------------------------------------------------- */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpened = !mobileMenu.classList.contains('opacity-0');
            if (isOpened) {
                // Close Drawer
                mobileMenu.classList.add('opacity-0', 'pointer-events-none');
                mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
                if (mobileMenuIcon) {
                    mobileMenuIcon.classList.remove('fa-xmark');
                    mobileMenuIcon.classList.add('fa-bars');
                }
            } else {
                // Open Drawer
                mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
                mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
                if (mobileMenuIcon) {
                    mobileMenuIcon.classList.remove('fa-bars');
                    mobileMenuIcon.classList.add('fa-xmark');
                }
            }
        });

        // Close mobile nav drawer when clicking any link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('opacity-0', 'pointer-events-none');
                mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
                if (mobileMenuIcon) {
                    mobileMenuIcon.classList.remove('fa-xmark');
                    mobileMenuIcon.classList.add('fa-bars');
                }
            });
        });
    }

    /* -------------------------------------------------------------
       2. Scroll Reveal Observer
       ------------------------------------------------------------- */
    const revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Trigger only once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('is-visible'));
    }

    /* -------------------------------------------------------------
       3. FAQ Accordion Panels
       ------------------------------------------------------------- */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const content = item.querySelector('.accordion-wrapper');

        if (trigger && content) {
            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('accordion-active');

                // Collapse all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('accordion-active')) {
                        otherItem.classList.remove('accordion-active');
                    }
                });

                // Toggle active class on clicked item
                if (isActive) {
                    item.classList.remove('accordion-active');
                } else {
                    item.classList.add('accordion-active');
                }
            });
        }
    });



    /* -------------------------------------------------------------
       5. Interactive Rent Savings Calculator
       ------------------------------------------------------------- */
    const stayRangeInput = document.getElementById('stay-range');
    const stayMonthsDisplay = document.getElementById('stay-months-display');
    const savingsDisplay = document.getElementById('savings-display');
    const standardTotalDisplay = document.getElementById('standard-total');
    const bulkTotalDisplay = document.getElementById('bulk-total');
    const claimSavingsBtn = document.getElementById('claim-savings-btn');

    if (stayRangeInput && stayMonthsDisplay && savingsDisplay && standardTotalDisplay && bulkTotalDisplay && claimSavingsBtn) {
        
        const updateCalculatorValues = () => {
            const months = parseInt(stayRangeInput.value, 10);
            
            // Core Rent Pricing: Standard ₹5,000 | Bulk ₹4,800
            const standardRate = 5000;
            const bulkRate = 4800;
            
            const totalStandard = standardRate * months;
            const totalBulk = bulkRate * months;
            const totalSavings = totalStandard - totalBulk;

            // Render text
            stayMonthsDisplay.textContent = months;
            savingsDisplay.textContent = totalSavings.toLocaleString('en-IN');
            standardTotalDisplay.textContent = totalStandard.toLocaleString('en-IN');
            bulkTotalDisplay.textContent = totalBulk.toLocaleString('en-IN');

            // Format WhatsApp Claim message text template
            const claimMsg = `Hi, I am interested in booking accommodation at Vivekananda Boys Hostel with the discounted Bulk Rate (₹4,800/mo) for a stay duration of ${months} months. Please let me know availability.`;
            claimSavingsBtn.href = `https://wa.me/919000426266?text=${encodeURIComponent(claimMsg)}`;
        };

        // Initialize and bind
        stayRangeInput.addEventListener('input', updateCalculatorValues);
        updateCalculatorValues(); // Initial execution
    }

    /* -------------------------------------------------------------
       6. College Proximity Widget
       ------------------------------------------------------------- */
    const proximityData = {
        chaitanya: { distance: "1.0 km", walk: "12 mins", cycle: "4 mins", transit: "2 mins" },
        jbiet: { distance: "1.2 km", walk: "14 mins", cycle: "5 mins", transit: "3 mins" },
        vjit: { distance: "1.5 km", walk: "18 mins", cycle: "6 mins", transit: "4 mins" },
        brightfield: { distance: "1.8 km", walk: "20 mins", cycle: "7 mins", transit: "4 mins" },
        bhaskar: { distance: "2.1 km", walk: "25 mins", cycle: "9 mins", transit: "5 mins" },
        gurukul: { distance: "2.5 km", walk: "30 mins", cycle: "10 mins", transit: "5 mins" },
        global: { distance: "3.5 km", walk: "42 mins", cycle: "14 mins", transit: "8 mins" }
    };

    const collegeSelect = document.getElementById('college-select');
    const distEl = document.getElementById('proximity-distance');
    const walkEl = document.getElementById('proximity-walk');
    const cycleEl = document.getElementById('proximity-cycle');
    const transitEl = document.getElementById('proximity-transit');

    if (collegeSelect && distEl && walkEl && cycleEl && transitEl) {
        collegeSelect.addEventListener('change', () => {
            const college = collegeSelect.value;
            const data = proximityData[college];
            
            if (data) {
                // Add brief fade animation out/in
                const elements = [distEl, walkEl, cycleEl, transitEl];
                elements.forEach(el => el.classList.add('opacity-40', 'transition-opacity', 'duration-150'));
                
                setTimeout(() => {
                    distEl.textContent = data.distance;
                    walkEl.textContent = data.walk;
                    cycleEl.textContent = data.cycle;
                    transitEl.textContent = data.transit;
                    
                    elements.forEach(el => el.classList.remove('opacity-40'));
                }, 150);
            }
        });
    }

    /* -------------------------------------------------------------
       7. Swami Vivekananda Quote Slider Carousel
       ------------------------------------------------------------- */
    const quoteSlides = document.querySelectorAll('.quote-slide');
    const quoteIndicators = document.querySelectorAll('.quote-indicator');
    let activeQuoteIndex = 0;
    let quoteInterval = null;

    const showQuoteSlide = (index) => {
        if (quoteSlides.length === 0) return;

        quoteSlides.forEach(slide => slide.classList.remove('active'));
        quoteIndicators.forEach(ind => ind.classList.remove('active'));

        activeQuoteIndex = (index + quoteSlides.length) % quoteSlides.length;

        quoteSlides[activeQuoteIndex].classList.add('active');
        if (quoteIndicators[activeQuoteIndex]) {
            quoteIndicators[activeQuoteIndex].classList.add('active');
        }
    };

    const nextQuoteSlide = () => {
        showQuoteSlide(activeQuoteIndex + 1);
    };

    // Global Quote Slide trigger for click indicators
    window.setQuoteSlide = (index) => {
        showQuoteSlide(index);
        resetQuoteTimer();
    };

    const startQuoteTimer = () => {
        quoteInterval = setInterval(nextQuoteSlide, 7000);
    };

    const resetQuoteTimer = () => {
        if (quoteInterval) {
            clearInterval(quoteInterval);
        }
        startQuoteTimer();
    };

    // Initialize Quotes
    if (quoteSlides.length > 0) {
        startQuoteTimer();
    }

    /* -------------------------------------------------------------
       8. Weekly Food Menu Switch Tabs
       ------------------------------------------------------------- */
    window.switchDayTab = (btnEl, dayId) => {
        // Toggle Active style class on buttons
        const allTabs = document.querySelectorAll('.day-tab');
        allTabs.forEach(tab => tab.classList.remove('active-chalk-tab'));
        btnEl.classList.add('active-chalk-tab');

        // Toggle visibility active class on content pane blocks
        const allPanes = document.querySelectorAll('.food-tab-pane');
        allPanes.forEach(pane => pane.classList.remove('active'));

        const targetPane = document.getElementById(dayId);
        if (targetPane) {
            targetPane.classList.add('active');
        }
    };

    /* -------------------------------------------------------------
       9. Bed Selector & Dynamic Form Linkage
       ------------------------------------------------------------- */
    let selectedBedId = null;
    let selectedBedRoomType = null;

    window.selectBed = (bedId, roomType) => {
        selectedBedId = bedId;
        selectedBedRoomType = roomType;

        // Clear previous selected styling highlights
        const allBedCards = document.querySelectorAll('.bed-card');
        allBedCards.forEach(card => card.classList.remove('selected'));

        // Highlight selected bed card
        const clickedCard = document.getElementById(`bed-${bedId}`);
        if (clickedCard) {
            clickedCard.classList.add('selected');
        }

        // Render values in selection status bar
        const selectionBar = document.getElementById('bed-selection-bar');
        const selectionLabel = document.getElementById('selected-bed-label');
        const reserveBtn = document.getElementById('reserve-bed-btn');

        if (selectionLabel) selectionLabel.textContent = `Bed ${bedId} (${roomType} Room)`;
        if (selectionBar) selectionBar.classList.remove('hidden');

        // Setup Direct Bed Booking Button message
        const directMsg = `Hi, I want to reserve Bed ${bedId} in the ${roomType} Room configuration at Vivekananda Boys Hostel. Please let me know availability and joining procedure.`;
        if (reserveBtn) reserveBtn.href = `https://wa.me/919000426266?text=${encodeURIComponent(directMsg)}`;

        // Sync and fill status in Contact Enquiry Form
        const formBedBlock = document.getElementById('form-bed-block');
        const formBedLabel = document.getElementById('form-selected-bed-label');
        const formRoomSelect = document.getElementById('form-room');

        if (formBedLabel) formBedLabel.textContent = `Bed ${bedId} (${roomType} Room)`;
        if (formBedBlock) formBedBlock.classList.remove('hidden');

        // Autofill room preference dropdown
        if (formRoomSelect) {
            if (roomType === '4-Sharing') {
                formRoomSelect.value = '4-Sharing Room';
            } else if (roomType === '5-Sharing') {
                formRoomSelect.value = '5-Sharing Room';
            }
        }
    };

    window.clearBedSelection = () => {
        selectedBedId = null;
        selectedBedRoomType = null;

        // Clear highlight
        const allBedCards = document.querySelectorAll('.bed-card');
        allBedCards.forEach(card => card.classList.remove('selected'));

        // Hide bars
        const selectionBar = document.getElementById('bed-selection-bar');
        const formBedBlock = document.getElementById('form-bed-block');

        if (selectionBar) selectionBar.classList.add('hidden');
        if (formBedBlock) formBedBlock.classList.add('hidden');
    };

    /* -------------------------------------------------------------
       10. Contact Form Validator & Enquiry Submission
       ------------------------------------------------------------- */
    const contactForm = document.getElementById('enquiry-form');
    const nameInput = document.getElementById('form-name');
    const phoneInput = document.getElementById('form-phone');
    const roomInput = document.getElementById('form-room');
    const messageInput = document.getElementById('form-message');
    const submitBtn = document.getElementById('form-submit');
    const formNotice = document.getElementById('form-notice');

    // Clear validation error style on user input
    [nameInput, phoneInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                input.classList.remove('input-error');
                const errElement = document.getElementById(`${input.id}-error`);
                if (errElement) errElement.classList.add('hidden');
            });
        }
    });

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;

            // Name check
            const nameVal = nameInput ? nameInput.value.trim() : '';
            const nameError = document.getElementById('form-name-error');
            if (nameVal.length < 3) {
                if (nameInput) nameInput.classList.add('input-error');
                if (nameError) {
                    nameError.textContent = 'Please enter your name (minimum 3 characters).';
                    nameError.classList.remove('hidden');
                }
                isValid = false;
            }

            // Phone check (10 digit format)
            const phoneVal = phoneInput ? phoneInput.value.trim() : '';
            const phoneError = document.getElementById('form-phone-error');
            const cleanPhone = phoneVal.replace(/\s+/g, '');
            const phoneRegex = /^[6-9]\d{9}$/;

            if (cleanPhone.length === 0) {
                if (phoneInput) phoneInput.classList.add('input-error');
                if (phoneError) {
                    phoneError.textContent = 'Please enter a phone number.';
                    phoneError.classList.remove('hidden');
                }
                isValid = false;
            } else if (!phoneRegex.test(cleanPhone)) {
                if (phoneInput) phoneInput.classList.add('input-error');
                if (phoneError) {
                    phoneError.textContent = 'Enter a valid 10-digit phone number (starts with 6-9).';
                    phoneError.classList.remove('hidden');
                }
                isValid = false;
            }

            if (isValid) {
                const selectedRoom = roomInput ? roomInput.value : '4-Sharing Room';
                const customMsg = messageInput ? messageInput.value.trim() : '';

                // Build WhatsApp inquiry message
                let messageTemplate = `New Enquiry for Vivekananda Boys Hostel:
Name: ${nameVal}
Phone: ${cleanPhone}
Room Preference: ${selectedRoom}`;

                // Append locked bed detail if selected
                if (selectedBedId) {
                    messageTemplate += `\nSelected Bed Position: Bed ${selectedBedId} (${selectedBedRoomType} Room)`;
                }

                messageTemplate += `\nMessage: ${customMsg ? customMsg : 'I would like to inquire about bed vacancies and check the rooms.'}`;

                // Primary Owner WhatsApp link
                const whatsappUrl = `https://wa.me/919000426266?text=${encodeURIComponent(messageTemplate)}`;
                window.open(whatsappUrl, '_blank');

                // Display success helper
                if (formNotice) {
                    formNotice.classList.remove('hidden');
                    setTimeout(() => {
                        formNotice.classList.add('hidden');
                    }, 8000);
                }

                // Reset form values & bed selection state
                contactForm.reset();
                clearBedSelection();
            }
        });
    }

    /* -------------------------------------------------------------
       12. Dynamic Cloud-Synchronized Food Menu Management
       ------------------------------------------------------------- */
    const MENU_DB_URL = 'https://jsonblob.com/api/jsonBlob/019f6c12-7650-7bab-a677-a8f0d4a5aafb';
    let foodMenuData = {};

    async function loadFoodMenu() {
        try {
            const response = await fetch(MENU_DB_URL);
            if (!response.ok) throw new Error('Database fetch failed');
            foodMenuData = await response.json();
            renderFoodMenu();
        } catch (error) {
            console.error('Error loading food menu:', error);
            // Clean dynamic default fallback structure
            foodMenuData = {
                monday: { breakfast: "Garam Idli & Vada", lunch: "Rice, Tomato Pappu", dinner: "Roti & Mixed Veg Curry" },
                tuesday: { breakfast: "Puri Sabji", lunch: "Rice, Veg Dal, Egg Curry", dinner: "Soft Roti & Curry" },
                wednesday: { breakfast: "Mysore Bajji", lunch: "Rice, Dal, Chicken Curry", dinner: "Roti & Curry" },
                thursday: { breakfast: "Garam Upma", lunch: "Rice, Tomato Pappu", dinner: "Roti & Mixed Veg Curry" },
                friday: { breakfast: "Garam Idli & Vada", lunch: "Rice, Veg Dal, Egg Curry", dinner: "Roti & Curry" },
                saturday: { breakfast: "Dosa & Chutney", lunch: "Rice, Tomato Pappu, Fry", dinner: "Soft Roti & Curry" },
                sunday: { breakfast: "Puri Sabji", lunch: "Rice, Special Chicken Biryani", dinner: "Soft Roti & Curry" }
            };
            renderFoodMenu();
        }
    }

    function renderFoodMenu() {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const meals = ['breakfast', 'lunch', 'dinner'];
        days.forEach(day => {
            meals.forEach(meal => {
                const el = document.getElementById(`${day}-${meal}`);
                if (el) {
                    if (el.getAttribute('contenteditable') !== 'true') {
                        el.textContent = foodMenuData[day] ? foodMenuData[day][meal] || '' : '';
                    }
                }
            });
        });
    }

    let menuEditMode = false;

    window.toggleMenuEditMode = () => {
        const passcode = prompt("Enter Owner Admin Passcode to edit the menu:");
        if (passcode === '90004') {
            menuEditMode = true;
            document.getElementById('edit-menu-btn').classList.add('hidden');
            document.getElementById('save-menu-btn').classList.remove('hidden');
            document.getElementById('cancel-menu-btn').classList.remove('hidden');

            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const meals = ['breakfast', 'lunch', 'dinner'];
            days.forEach(day => {
                meals.forEach(meal => {
                    const el = document.getElementById(`${day}-${meal}`);
                    if (el) {
                        el.setAttribute('contenteditable', 'true');
                        el.classList.add('border', 'border-dashed', 'border-primary/50', 'p-1.5', 'rounded', 'bg-card', 'outline-none', 'focus:border-primary', 'focus:ring-1', 'focus:ring-primary');
                    }
                });
            });
        } else if (passcode !== null) {
            alert("Incorrect admin passcode!");
        }
    };

    window.cancelMenuEdit = () => {
        menuEditMode = false;
        document.getElementById('edit-menu-btn').classList.remove('hidden');
        document.getElementById('save-menu-btn').classList.add('hidden');
        document.getElementById('cancel-menu-btn').classList.add('hidden');

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const meals = ['breakfast', 'lunch', 'dinner'];
        days.forEach(day => {
            meals.forEach(meal => {
                const el = document.getElementById(`${day}-${meal}`);
                if (el) {
                    el.removeAttribute('contenteditable');
                    el.classList.remove('border', 'border-dashed', 'border-primary/50', 'p-1.5', 'rounded', 'bg-card', 'outline-none', 'focus:border-primary', 'focus:ring-1', 'focus:ring-primary');
                }
            });
        });
        renderFoodMenu();
    };

    window.saveMenu = async () => {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const meals = ['breakfast', 'lunch', 'dinner'];
        const updatedData = {};

        days.forEach(day => {
            updatedData[day] = {};
            meals.forEach(meal => {
                const el = document.getElementById(`${day}-${meal}`);
                updatedData[day][meal] = el ? el.textContent.trim() : '';
            });
        });

        const saveBtn = document.getElementById('save-menu-btn');
        const originalHTML = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Saving...';

        try {
            const response = await fetch(MENU_DB_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) throw new Error('Database save failed');
            
            foodMenuData = updatedData;
            alert("Menu updated successfully! The new menu is now live for all visitors.");
            
            menuEditMode = false;
            document.getElementById('edit-menu-btn').classList.remove('hidden');
            saveBtn.classList.add('hidden');
            document.getElementById('cancel-menu-btn').classList.add('hidden');

            days.forEach(day => {
                meals.forEach(meal => {
                    const el = document.getElementById(`${day}-${meal}`);
                    if (el) {
                        el.removeAttribute('contenteditable');
                        el.classList.remove('border', 'border-dashed', 'border-primary/50', 'p-1.5', 'rounded', 'bg-card', 'outline-none', 'focus:border-primary', 'focus:ring-1', 'focus:ring-primary');
                    }
                });
            });
            renderFoodMenu();
        } catch (error) {
            console.error('Error saving menu:', error);
            alert("Failed to save menu online. Please check your internet connection and try again.");
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalHTML;
        }
    };

    // Load menu on start
    loadFoodMenu();

    /* -------------------------------------------------------------
       8. Interactive Photo & Video Gallery Lightbox
       ------------------------------------------------------------- */
    const galleryItems = [
        { type: 'video', src: 'images/hostel-walkthrough.mp4', title: 'Official Video Tour 1' },
        { type: 'video', src: 'images/hostel-video-2.mp4', title: 'Hostel Facilities Tour 2' },
        { type: 'video', src: 'images/hostel-video-3.mp4', title: 'Hostel Rooms & Amenities Tour 3' },
        { type: 'image', src: 'images/vbh-official-poster.jpg', title: 'Official Facilities & Rent Poster' },
        { type: 'image', src: 'images/vbh-food-banner.jpg', title: 'Official Dining & Food Showcase Banner' },
        { type: 'image', src: 'images/food-idli.jpg', title: 'Steaming Idli & Sambar' },
        { type: 'image', src: 'images/food-dosa.jpg', title: 'Crispy Dosa & Chutney' },
        { type: 'image', src: 'images/food-puri.jpg', title: 'Puri & Curry' },
        { type: 'image', src: 'images/food-vada.jpg', title: 'Crispy Vada & Bonda' },
        { type: 'image', src: 'images/food-chapati.jpg', title: 'Soft Chapati & Curry' },
        { type: 'image', src: 'images/food-rice-meals.jpg', title: 'South Indian Rice & Curries' }
    ];

    let currentGalleryIndex = 0;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxBackdrop = document.querySelector('.lightbox-backdrop');

    function openLightbox(index) {
        if (!lightbox) return;
        currentGalleryIndex = index;
        updateLightboxContent();
        lightbox.classList.remove('opacity-0', 'pointer-events-none');
        lightbox.classList.add('opacity-100', 'pointer-events-auto');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.add('opacity-0', 'pointer-events-none');
        lightbox.classList.remove('opacity-100', 'pointer-events-auto');
        document.body.style.overflow = '';
        if (lightboxVideo) {
            lightboxVideo.pause();
        }
    }

    function updateLightboxContent() {
        const item = galleryItems[currentGalleryIndex];
        if (!item) return;

        if (item.type === 'video') {
            if (lightboxImg) lightboxImg.classList.add('hidden');
            if (lightboxVideo) {
                lightboxVideo.src = item.src;
                lightboxVideo.classList.remove('hidden');
                lightboxVideo.play().catch(() => {});
            }
        } else {
            if (lightboxVideo) {
                lightboxVideo.pause();
                lightboxVideo.classList.add('hidden');
            }
            if (lightboxImg) {
                lightboxImg.src = item.src;
                lightboxImg.alt = item.title;
                lightboxImg.classList.remove('hidden');
            }
        }

        if (lightboxTitle) lightboxTitle.textContent = item.title;
        if (lightboxCounter) lightboxCounter.textContent = `${item.type === 'video' ? 'Video' : 'Photo'} ${currentGalleryIndex + 1} of ${galleryItems.length}`;
    }

    // Attach click handlers to all gallery triggers
    document.querySelectorAll('.gallery-trigger').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.getAttribute('data-index') || '0', 10);
            openLightbox(idx);
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
            updateLightboxContent();
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
            updateLightboxContent();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!lightbox || lightbox.classList.contains('opacity-0')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
        if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
    });

    /* =========================================================================
       8. Hostel Photo Gallery Lightbox Initialization
       ========================================================================= */

});


