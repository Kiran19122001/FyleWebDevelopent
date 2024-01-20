const apiUrl = "https://api.github.com";
let currentPages = 10;
let totalRepositories = 0;

function displayRepositories(repositories) {
  const repositoriesContainer = document.getElementById("repositories");
  const userContainer = document.getElementById("user-container");

  // Display user information
  userContainer.innerHTML = "";

  // Display repositories
  repositories.forEach((repo) => {
    const repoElement = document.createElement("div");
    repoElement.classList.add("repository");

    // Fetch detailed language information
    fetch(repo.languages_url)
      .then((response) => response.json())
      .then((languagesData) => {
        const languagesHTML = Object.entries(languagesData || {})
          .map(
            ([language]) => `
                    <p class=laguage-names>${language}</p>
                `
          )
          .join("");

        repoElement.innerHTML = `
                    <h3 class=repo-name>${repo.name}</h3>
                    <p class=discription>${
                      repo.description || "No description available"
                    }</p>
                    <div class="language-container"><p class="${
                      languagesHTML === "" ? "not-app" : ""
                    }">${languagesHTML === "" ? "N/A" : languagesHTML}</p></div>
                `;
        repositoriesContainer.appendChild(repoElement);
      })
      .catch((error) => {
        console.error("Error fetching language data:", error);
        repoElement.innerHTML =
          "<p>Error fetching language data. Please try again.</p>";
        repositoriesContainer.appendChild(repoElement);
      });
  });
}

function fetchRepositories() {
  const username = document.getElementById("username").value;
  const loader = document.getElementById("loader");
  const repositoriesContainer = document.getElementById("repositories");
  const userContainer = document.getElementById("user-container");
  const paginationContainer = document.getElementById("pagination");
  const buttons = document.getElementById("buttons");

  // Show loader while fetching data
  loader.style.display = "block";
  repositoriesContainer.innerHTML = "";
  userContainer.innerHTML = ""; // Clear user container
  paginationContainer.innerHTML = ""; // Clear pagination container
  buttons.innerHTML = ""; // older button

  // Make API call to fetch repositories
  fetch(`${apiUrl}/users/${username}/repos?per_page=${currentPages}`)
    .then((response) => response.json())
    .then((data) => {
      // Hide loader after repositories data is fetched
      loader.style.display = "none";
      totalRepositories = data.public_repos;
      console.log(data);

      // Display repositories
      displayRepositories(data);

      // Display pagination
      displayPagination(data);

      // Fetch user data and display it
      fetch(`${apiUrl}/users/${username}`)
        .then((response) => response.json())
        .then((userData) => {
          // Display user data
          displayUserData(userData);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          // Handle error if user data cannot be fetched
        });
    })
    .catch((error) => {
      console.error("Error fetching repositories:", error);
      loader.style.display = "none";
      repositoriesContainer.innerHTML =
        "<p>Error fetching repositories. Please try again.</p>";
    });
}

function displayPagination(data) {
  const paginationContainer = document.getElementById("pagination");
  const buttonsPerPage = 10;
  let currentPage = 1;

  // Function to show or hide buttons based on the current page
  function updateButtonVisibility() {
    const buttons = document.querySelectorAll(".number-button");
    buttons.forEach((button, index) => {
      button.classList.add(
        `${
          parseInt(sessionStorage.getItem("count") - 1) === index
            ? "active-button"
            : "unactive"
        }`
      );
      button.style.display =
        index < (currentPage - 1) * buttonsPerPage ||
        index >= currentPage * buttonsPerPage
          ? "none"
          : "inline-block";
    });
  }

  // Create backward button (<<)
  const backwardButton = document.createElement("button");
  backwardButton.innerText = "<<";
  backwardButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updateButtonVisibility();
    }
  });
  paginationContainer.appendChild(backwardButton);

  // Create number buttons (1 to 100)

  for (let i = 1; i <= 100; i++) {
    const numberButton = document.createElement("button");
    numberButton.type = "button";
    numberButton.classList.add("number-button"); // Add a class for easy selection
    numberButton.innerText = i;

    // Create input tag inside each button
    const inputTag = document.createElement("input");
    inputTag.type = "hidden";
    inputTag.value = i;
    numberButton.appendChild(inputTag);

    // Add click event listener to each number button
    numberButton.addEventListener("click", () => {
      const selectedNumber = parseInt(inputTag.value);
      sessionStorage.setItem("count", selectedNumber);
      currentPages = selectedNumber;
      currentPage = selectedNumber;
      if (selectedNumber > totalRepositories) {
        currentPages = totalRepositories;
      } else {
        currentPages = selectedNumber;
      }
      fetchRepositories();

      // Handle the click event, you may want to fetch data based on the selected number
    });

    paginationContainer.appendChild(numberButton);
  }
  // Create forward button (>>)
  const forwardButton = document.createElement("button");
  forwardButton.innerText = ">>";
  forwardButton.addEventListener("click", () => {
    const totalButtons = document.querySelectorAll(".number-button").length;
    const totalPages = Math.ceil(totalButtons / buttonsPerPage);

    if (currentPage < totalPages) {
      currentPage++;
      updateButtonVisibility();
    }
  });

  paginationContainer.appendChild(forwardButton);

  // Show only the first set of buttons initially
  const olderButton = document.createElement("button");
  const newerButton = document.createElement("button");

  olderButton.innerText = "<-- Older";
  newerButton.innerText = "Newer -->";

  olderButton.classList.add(
    `${currentPages > 10 ? "active-button" : "inactive-button"}`
  );
  newerButton.classList.add(
    `${currentPage < currentPages ? "active-button" : "inactive-button"}`
  );
  buttons.appendChild(olderButton);
  buttons.appendChild(newerButton);

  olderButton.addEventListener("click", () => {
    if (currentPages > 1) {
      sessionStorage.setItem("count", currentPages - 1);
      currentPages = currentPages - 1;
      fetchRepositories();
    }
  });

  newerButton.addEventListener("click", () => {
    if (currentPage < currentPages) {
      sessionStorage.setItem("count", currentPages + 1);
      currentPages = currentPages + 1;
      fetchRepositories();
    }
  });
  updateButtonVisibility();
}

function displayUserData(userData) {
  const userContainer = document.getElementById("user-container");
  userContainer.innerHTML = `
        <img src="${userData.avatar_url}" alt="User Avatar" class=profile-image>
        <div>
        <h2 class=user-name>${userData.name}</h2>
        <p>${userData.bio || "No bio available"}</p>
        <p> 
        <i class="fa-solid fa-location-dot"></i>
        ${userData.location || "N/A"}</p>
        <p>GitHub: <a href="${userData.html_url}" target="_blank">${
    userData.html_url
  }</a></p>
        </div>
    `;
}
