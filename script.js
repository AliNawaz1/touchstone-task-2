const productCatalog = [
    { id: "breads", name: "Breads" },
    { id: "pastries", name: "Pastries" },
    { id: "cakes", name: "Cakes" },
    { id: "signature-loaf", name: "Signature Loaf" }
];

let favoriteProductIds = [];

const favoritesStorageKey = "northStarBakeryFavorites";
const requestTypeStorageKey = "northStarBakeryRequestType";

const validationRules = [
    {
        fieldId: "name",
        errorId: "name-error",
        isValid: value => value.trim().length > 0,
        message: "Please enter your name."
    },
    {
        fieldId: "email",
        errorId: "email-error",
        isValid: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
        message: "Enter an email address in a format like name@example.com."
    },
    {
        fieldId: "pickup-date",
        errorId: "pickup-date-error",
        isValid: value => value.trim().length > 0,
        message: "Please choose a pickup date."
    },
    {
        fieldId: "request-type",
        errorId: "request-type-error",
        isValid: value => value !== "",
        message: "Please choose a request type."
    },
    {
        fieldId: "item-details",
        errorId: "item-details-error",
        isValid: value => value.trim().length >= 10,
        message: "Please enter at least 10 characters about your order or question."
    }
];

function loadFavoriteProducts() {
    try {
        const savedFavorites = JSON.parse(
            localStorage.getItem(favoritesStorageKey) || "[]"
        );

        if (Array.isArray(savedFavorites)) {
            favoriteProductIds = savedFavorites.filter(id =>
                productCatalog.some(product => product.id === id)
            );
        }
    } catch {
        favoriteProductIds = [];
    }
}

function saveFavoriteProducts() {
    try {
        localStorage.setItem(
            favoritesStorageKey,
            JSON.stringify(favoriteProductIds)
        );
    } catch {
        // Favorites still work for this visit if browser storage is unavailable.
    }
}

function renderFavoriteProducts() {
    const favoriteList = document.getElementById("favorite-list");
    const favoriteStatus = document.getElementById("favorite-status");

    if (!favoriteList || !favoriteStatus) {
        return;
    }

    favoriteList.replaceChildren();

    const favoriteProducts = favoriteProductIds
        .map(id => productCatalog.find(product => product.id === id))
        .filter(Boolean);

    favoriteProducts.forEach(product => {
        const listItem = document.createElement("li");
        listItem.textContent = product.name;
        favoriteList.appendChild(listItem);
    });

    document.querySelectorAll("[data-favorite-button]").forEach(button => {
        const product = productCatalog.find(
            item => item.id === button.dataset.productId
        );

        if (!product) {
            return;
        }

        const isFavorite = favoriteProductIds.includes(product.id);
        button.setAttribute("aria-pressed", String(isFavorite));
        button.textContent = isFavorite
            ? `Remove ${product.name} from favorites`
            : `Add ${product.name} to favorites`;
    });

    if (favoriteProducts.length === 0) {
        favoriteStatus.textContent =
            "You have no favorites saved yet. Use the buttons above to save products for a possible preorder.";
    } else {
        favoriteStatus.textContent =
            `You have ${favoriteProducts.length} favorite product(s) saved.`;
    }
}

function toggleFavorite(event) {
    const productId = event.currentTarget.dataset.productId;
    const favoriteIndex = favoriteProductIds.indexOf(productId);

    if (favoriteIndex === -1) {
        favoriteProductIds.push(productId);
    } else {
        favoriteProductIds.splice(favoriteIndex, 1);
    }

    saveFavoriteProducts();
    renderFavoriteProducts();
}

function setupFavorites() {
    const favoriteList = document.getElementById("favorite-list");

    if (!favoriteList) {
        return;
    }

    loadFavoriteProducts();

    document.querySelectorAll("[data-favorite-button]").forEach(button => {
        button.addEventListener("click", toggleFavorite);
    });

    renderFavoriteProducts();
}

function setupRequestTypeStorage() {
    const requestType = document.getElementById("request-type");
    const requestTypeNote = document.getElementById("request-type-note");

    if (!requestType || !requestTypeNote) {
        return;
    }

    try {
        const savedRequestType = localStorage.getItem(requestTypeStorageKey);
        const savedOptionExists = Array.from(requestType.options).some(
            option => option.value === savedRequestType && option.value !== ""
        );

        if (savedOptionExists) {
            requestType.value = savedRequestType;
            const selectedText =
                requestType.options[requestType.selectedIndex].textContent;
            requestTypeNote.textContent =
                `Your previous selection, ${selectedText}, was restored.`;
        }
    } catch {
        requestTypeNote.textContent = "";
    }

    requestType.addEventListener("change", () => {
        try {
            if (requestType.value) {
                localStorage.setItem(
                    requestTypeStorageKey,
                    requestType.value
                );
                requestTypeNote.textContent =
                    "Your request type will be remembered in this browser.";
            } else {
                localStorage.removeItem(requestTypeStorageKey);
                requestTypeNote.textContent = "";
            }
        } catch {
            requestTypeNote.textContent =
                "This browser could not save your request type.";
        }
    });
}

function showFieldError(rule, message) {
    const field = document.getElementById(rule.fieldId);
    const errorMessage = document.getElementById(rule.errorId);

    field.setAttribute("aria-invalid", String(message !== ""));
    errorMessage.textContent = message;
}

function handleFieldEdit(event) {
    const rule = validationRules.find(
        item => item.fieldId === event.target.id
    );

    if (!rule || !rule.isValid(event.target.value)) {
        return;
    }

    showFieldError(rule, "");

    const allFieldsAreValid = validationRules.every(item => {
        const field = document.getElementById(item.fieldId);
        return item.isValid(field.value);
    });

    if (allFieldsAreValid) {
        document.getElementById("form-status").textContent = "";
    }
}

function handleContactFormSubmit(event) {
    event.preventDefault();

    const invalidFields = [];

    validationRules.forEach(rule => {
        const field = document.getElementById(rule.fieldId);

        if (rule.isValid(field.value)) {
            showFieldError(rule, "");
        } else {
            showFieldError(rule, rule.message);
            invalidFields.push(field);
        }
    });

    const formStatus = document.getElementById("form-status");

    if (invalidFields.length > 0) {
        formStatus.textContent =
            "Please correct the highlighted fields and try again.";
        invalidFields[0].focus();
        return;
    }

    formStatus.textContent =
        "Your request is complete. This demo does not send it to the bakery.";
}

function setupContactForm() {
    const form = document.getElementById("contact-form");

    if (!form) {
        return;
    }

    form.addEventListener("submit", handleContactFormSubmit);
    form.addEventListener("input", handleFieldEdit);
    form.addEventListener("change", handleFieldEdit);
}

setupFavorites();
setupRequestTypeStorage();
setupContactForm();