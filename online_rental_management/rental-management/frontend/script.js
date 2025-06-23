// script.js - Final Consolidated Version

const API_BASE_URL = 'http://localhost:3000/api/properties';

// --- Helper Functions (common to multiple pages) ---
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return 'N/A';
    return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Invalid Date';
    }
}

// Function to navigate to property details page
function navigateToPropertyDetails(propertyId) {
    window.location.href = `property-details.html?id=${propertyId}`;
}

// --- Page-Specific Logic Execution ---
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;

    // --- Logic for index.html (Property Listings) ---
    // Checks if the current path is the root or specifically index.html
    if (currentPath === '/' || currentPath.includes('/index.html')) {
        const propertyListingsDiv = document.getElementById('propertyListings');
        const searchLocationInput = document.getElementById('searchLocation');
        const searchButton = document.getElementById('searchButton');
        const filterPropertyTypeSelect = document.getElementById('filterPropertyType');
        const filterMinRentInput = document.getElementById('filterMinRent');
        const filterMaxRentInput = document.getElementById('filterMaxRent');
        const filterBedroomsInput = document.getElementById('filterBedrooms');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');

        // Function to Fetch and Display Properties
        async function fetchProperties(filters = {}) {
            let url = new URL(API_BASE_URL);
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    url.searchParams.append(key, filters[key]);
                }
            });

            try {
                const response = await fetch(url.toString());
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const properties = await response.json();
                renderProperties(properties);
            } catch (error) {
                console.error('Error fetching properties:', error);
                propertyListingsDiv.innerHTML = '<p class="error-message"><i class="fas fa-exclamation-triangle"></i> Failed to load properties. Please check your backend server and try again.</p>';
            }
        }

        // Function to Render Properties to the DOM
        function renderProperties(properties) {
            propertyListingsDiv.innerHTML = ''; // Clear existing content

            if (properties.length === 0) {
                propertyListingsDiv.innerHTML = '<p class="info-message"><i class="fas fa-info-circle"></i> No properties found matching your criteria. Try adjusting your filters!</p>';
                return;
            }

            properties.forEach(property => {
                const propertyCard = document.createElement('div');
                propertyCard.classList.add('property-card');

                const beds = property.bedrooms || 0;
                const baths = property.bathrooms || 0;
                const area = property.areaSqFt || 0;

                propertyCard.innerHTML = `
                    <img src="${property.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image+Available'}" alt="${property.title}">
                    <div class="property-card-content">
                        <h3>${property.title}</h3>
                        <p class="rent">${formatCurrency(property.rent)}/month</p>
                        <p><i class="fas fa-map-marker-alt"></i> <strong>${property.location}</strong></p>
                        <div class="details-grid">
                            <p><i class="fas fa-bed"></i> ${beds} Beds</p>
                            <p><i class="fas fa-bath"></i> ${baths} Baths</p>
                            <p><i class="fas fa-ruler-combined"></i> ${area} sq.ft.</p>
                        </div>
                        <p class="property-description">${property.description.substring(0, 100)}${property.description.length > 100 ? '...' : ''}</p>
                        <button class="view-details-btn" data-id="${property._id}"><i class="fas fa-info-circle"></i> View Details</button>
                    </div>
                `;
                propertyListingsDiv.appendChild(propertyCard);
            });

            document.querySelectorAll('.view-details-btn').forEach(button => {
                button.addEventListener('click', (event) => navigateToPropertyDetails(event.target.dataset.id));
            });
        }

        // Event Listeners for Index Page
        if (searchButton) { // Ensure elements exist before adding listeners
            searchButton.addEventListener('click', () => {
                const filters = { location: searchLocationInput.value.trim() };
                fetchProperties(filters);
            });
        }

        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                const filters = {
                    propertyType: filterPropertyTypeSelect.value,
                    minRent: filterMinRentInput.value,
                    maxRent: filterMaxRentInput.value,
                    bedrooms: filterBedroomsInput.value,
                };
                fetchProperties(filters);
            });
        }

        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                searchLocationInput.value = '';
                filterPropertyTypeSelect.value = '';
                filterMinRentInput.value = '';
                filterMaxRentInput.value = '';
                filterBedroomsInput.value = '';
                fetchProperties(); // Fetch all properties without filters
            });
        }

        // Initial fetch for index page
        fetchProperties();

    }
    // --- Logic for add-property.html ---
    else if (currentPath.includes('/add-property.html')) {
        const addPropertyForm = document.getElementById('addPropertyForm');

        if (addPropertyForm) { // Ensure the form element exists
            async function addProperty(event) {
                event.preventDefault();

                const newProperty = {
                    title: document.getElementById('title').value,
                    description: document.getElementById('description').value,
                    rent: parseInt(document.getElementById('rent').value),
                    bedrooms: parseInt(document.getElementById('bedrooms').value),
                    bathrooms: parseInt(document.getElementById('bathrooms').value),
                    areaSqFt: parseInt(document.getElementById('areaSqFt').value),
                    location: document.getElementById('location').value,
                    address: document.getElementById('address').value,
                    imageUrl: document.getElementById('imageUrl').value,
                    contactNumber: document.getElementById('contactNumber').value,
                    ownerName: document.getElementById('ownerName').value,
                    propertyType: document.getElementById('propertyType').value,
                };

                const requiredFields = ['title', 'description', 'rent', 'location', 'address', 'contactNumber', 'ownerName', 'propertyType'];
                for (const field of requiredFields) {
                    if (!newProperty[field]) {
                        alert(`Please fill in the "${field}" field.`);
                        return;
                    }
                }
                if (isNaN(newProperty.rent) || newProperty.rent <= 0) {
                    alert('Rent must be a positive number.');
                    return;
                }

                try {
                    const response = await fetch(API_BASE_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newProperty)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Failed to add property: ${errorData.message || response.statusText}`);
                    }

                    const addedProperty = await response.json();
                    alert('Property added successfully!');
                    addPropertyForm.reset();
                    // Optionally redirect to index.html after adding
                    // window.location.href = 'index.html';
                } catch (error) {
                    console.error('Error adding property:', error);
                    alert('Failed to add property. Check console for details.');
                }
            }
            addPropertyForm.addEventListener('submit', addProperty);
        }
    }
    // --- Logic for property-details.html ---
    else if (currentPath.includes('/property-details.html')) {
        const propertyDetailContent = document.getElementById('propertyDetailContent');
        const loadingErrorDiv = document.getElementById('loadingError');

        async function fetchAndRenderPropertyDetails(propertyId) {
            try {
                if (loadingErrorDiv) loadingErrorDiv.style.display = 'none';
                if (propertyDetailContent) propertyDetailContent.innerHTML = '<p>Loading property details...</p>'; // Show loading state

                const response = await fetch(`${API_BASE_URL}/${propertyId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const property = await response.json();

                if (!propertyDetailContent) return; // Exit if element not found

                if (!property) {
                    propertyDetailContent.innerHTML = '<p class="info-message">Property not found.</p>';
                    return;
                }

                const beds = property.bedrooms || 0;
                const baths = property.bathrooms || 0;
                const area = property.areaSqFt || 0;
                const availableDate = formatDate(property.availableFrom);

                propertyDetailContent.innerHTML = `
                    <img src="${property.imageUrl || 'https://via.placeholder.com/800x600?text=No+Image+Available'}" alt="${property.title}">
                    <h2>${property.title}</h2>
                    <p class="rent">${formatCurrency(property.rent)}/month</p>

                    <div class="property-detail-info">
                        <p><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${property.location}</p>
                        <p><i class="fas fa-address-card"></i> <strong>Address:</strong> ${property.address}</p>
                        <p><i class="fas fa-building"></i> <strong>Type:</strong> ${property.propertyType}</p>
                        <p><i class="fas fa-bed"></i> <strong>Bedrooms:</strong> ${beds}</p>
                        <p><i class="fas fa-bath"></i> <strong>Bathrooms:</strong> ${baths}</p>
                        <p><i class="fas fa-ruler-combined"></i> <strong>Area:</strong> ${area} sq.ft.</p>
                        <p><i class="fas fa-calendar-alt"></i> <strong>Available From:</strong> ${availableDate}</p>
                        <p><i class="fas fa-phone"></i> <strong>Contact:</strong> ${property.ownerName} (${property.contactNumber})</p>
                    </div>

                    <div class="property-detail-description">
                        <h3>Description</h3>
                        <p>${property.description}</p>
                    </div>

                    <div class="property-detail-actions">
                        <button class="edit-btn" data-id="${property._id}"><i class="fas fa-edit"></i> Edit Listing</button>
                        <button class="delete-btn" data-id="${property._id}"><i class="fas fa-trash-alt"></i> Delete Listing</button>
                        <a href="book-property.html?propertyId=${property._id}" class="submit-btn" style="background-color: var(--accent-green);"><i class="fas fa-calendar-check"></i> Book Now</a>
                    </div>
                `;

                // Add event listeners for edit/delete buttons on this page
                document.querySelector('.edit-btn').addEventListener('click', () => {
                    alert(`Edit feature for property ${property._id} is under construction.`);
                    // TODO: Implement actual edit functionality (e.g., redirect to add-property.html with ID to prefill)
                });
                document.querySelector('.delete-btn').addEventListener('click', async () => {
                    if (confirm(`Are you sure you want to delete property "${property.title}"?`)) {
                        try {
                            const response = await fetch(`${API_BASE_URL}/${property._id}`, { method: 'DELETE' });
                            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                            alert('Property deleted successfully!');
                            window.location.href = 'index.html'; // Go back to listings
                        } catch (error) {
                            console.error('Error deleting property:', error);
                            alert('Failed to delete property. Check console.');
                        }
                    }
                });

            } catch (error) {
                console.error('Error fetching and rendering property details:', error);
                if (propertyDetailContent) propertyDetailContent.innerHTML = ''; // Clear loading message
                if (loadingErrorDiv) loadingErrorDiv.style.display = 'block'; // Show error message
            }
        }

        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('id');
        if (propertyId) {
            fetchAndRenderPropertyDetails(propertyId);
        } else {
            if (propertyDetailContent) propertyDetailContent.innerHTML = '<p class="error-message"><i class="fas fa-exclamation-circle"></i> No property ID provided in the URL.</p>';
            if (loadingErrorDiv) loadingErrorDiv.style.display = 'none';
        }
    }
    // --- Logic for login.html ---
    else if (currentPath.includes('/login.html')) {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;

                alert(`Login attempt for Email: ${email}, Password: ${password}\n(Backend authentication logic needed here!)`);
                // TODO: Implement actual login logic:
                // 1. Send POST request to /api/auth/login endpoint
                // 2. Receive JWT token from backend
                // 3. Store JWT in localStorage/sessionStorage
                // 4. Redirect to user profile or properties page
            });
        }
    }
    // --- Logic for signup.html ---
    else if (currentPath.includes('/signup.html')) {
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const username = document.getElementById('signupUsername').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                const confirmPassword = document.getElementById('signupConfirmPassword').value;

                if (password !== confirmPassword) {
                    alert('Passwords do not match!');
                    return;
                }

                alert(`Sign up attempt for Username: ${username}, Email: ${email}\n(Backend registration logic needed here!)`);
                // TODO: Implement actual signup logic:
                // 1. Send POST request to /api/auth/register endpoint
                // 2. Handle success/error response
                // 3. Redirect to login page or directly log in
            });
        }
    }
    // --- Logic for book-property.html (Placeholder) ---
    else if (currentPath.includes('/book-property.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('propertyId');
        if (propertyId) {
            // alert(`Book Property page for ID: ${propertyId}\n(Implement booking form and logic here)`);
            // TODO: Fetch property details if needed to display on booking form
            // TODO: Create a form for booking dates, tenant info, etc.
            // TODO: Implement POST request to a /api/bookings endpoint
        }
    }
    // --- Logic for user-profile.html (Placeholder) ---
    else if (currentPath.includes('/user-profile.html')) {
        // alert("User Profile page. (Implement fetching user data and displaying here)");
        // TODO: Requires user authentication to get current user's data
        // TODO: Fetch user details from /api/user/profile endpoint
        // TODO: Display user's listed properties, booked properties, etc.
    }
});