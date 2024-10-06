# **Celestia - NASA Space Apps Challenge**

Welcome to the official repository **Celestia**, created as part of our hackathon submission for the NASA Space Apps Challenge! The project topic is **Navigator for the Habitable Worlds Observatory (HWO): Mapping the Characterizable Exoplanets in our Galaxy**.

> 🚀 **Live Demo:** [Click here!](test)

---

## **Table of Contents**
1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Technologies Used](#technologies-used)
4. [Setup and Installation](#setup-and-installation)
5. [File Structure](#file-structure)
6. [Contributors](#contributors)
7. [License](#license)

---

## **Overview**

**Celestia** was developed with the goal of **Visualising the exoplanets**. It’s designed to **View exoplanets** like viewing through the telescope based on different diameters and a 3D game-like control where the user can move freely around the space.

This repository includes the full source code for the project, covering everything from the UI to react functionality and even a python file for setting up the json file based on the required data from the dataset provided by NASA.

---

## **Key Features**

Here are the core features that set **Celestia** apart:

- **Data Loading:** Our system efficiently loads the data when the page is loaded and the data is available for each exoplanet, ensuring quick response times and seamless performance.
  
- **Clean User Interface:** Designed with ease of use in mind, our UI delivers a smooth user experience for PC/laptop screen sizes.
  
- **[Telescope View]:** The **Telescope View** is made to kinda resemble what the HWO telescope can see.
  
- **[3D View]:** **3D View** is made to let users explore the 3D space provided freely using the 3D Game-like Controls.

---

## **Technologies Used**

We utilized the following technologies to build **Celestia**:

- **Frontend:** React, HTML5, CSS3, JavaScript
- **Database:** csv, json
- **Additional Tools:** Git, VS Code, Figma, After Effects

---

## **Setup and Installation**

Follow these steps to run the project locally(Assuming you have all the nessasary things like npm(Node Package Manager), Git and three.js installed):

1. **Clone the repository:**

   ```bash
   git clone https://github.com/MTCodes01/The-Solsticers.git
   cd The-Solsticers
   cd sreedev
   ```

2. **Install dependencies:**
   For the Frontend:

   ```bash
   npm install --save three
   npm install --save-dev vite
   ```

3. **Run the application:**

   ```bash
   npx vite
   ```

4. **Access the site** by navigating to http://localhost:5173 in your browser.
