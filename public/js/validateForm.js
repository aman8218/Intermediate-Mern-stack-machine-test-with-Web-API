function validateForm() {
    let name = document.getElementById('name').value.trim();
    let email = document.getElementById('email').value.trim();
    let mobile = document.getElementById('mobile').value.trim();
    let designation = document.getElementById('designation').value;
    let gender = document.querySelector('input[name="gender"]:checked');
    let course = document.querySelectorAll('input[name="course"]:checked');
    let image = document.getElementById('image').value.trim();

    if (name === "" || email === "" || mobile === "" || designation === "" || !gender || course.length === 0 || image === "") {
        alert("Please fill in all fields.");
        return false;
    }

    // Email validation
    let emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return false;
    }

    // Mobile validation
    let mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
        alert("Please enter a valid 10-digit mobile number.");
        return false;
    }

    // Image file extension validation
    let allowedExtensions = /\.(jpg|jpeg|png)$/i;
    if (!allowedExtensions.test(image)) {
        alert("Please upload a valid JPG or PNG image file.");
        return false;
    }

    return true;
}