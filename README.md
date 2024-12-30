# React Canvas Game 🎮

A simple 2D game created with React and HTML5 Canvas. The player, represented by a **yellow circle**, moves horizontally and vertically to avoid or collide with **black boxes**. Black boxes move toward the player, and when a collision occurs, the box is destroyed.

---

## 🔠 Features

- **Player Movement:** Use the keyboard to move the yellow circle horizontally across the canvas.
- **Obstacle Generation:** green slimes appear dynamically and move toward the player.
- **Collision Detection:** Destroy green slimes when they collide with the player.
- **Gameplay Limit:** 5 seconds delay between slime spawn.

---

## 📚 How to Play

1. Use the **arrow keys** keys to move the yellow circle.
2. Avoid or collide with the black boxes as they approach.
3. Destroy black boxes by making contact with them.

---

## 🖥️ Installation

Follow these steps to set up and play the game:

1. Clone the repository:
   ```bash
   git clone https://github.com/DrKins/react-canvas-game.git
   ```
2. Navigate into the project folder:
   ```bash
   cd react-canvas-game
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📂 File Structure

```plaintext
react-canvas-game/
├── public/
│   └── index.html       # Main HTML file
├── src/
│   │── assets/
│   │── utils/
│   │   └── randomIntFromInterval.ts
│   │   └── intersects.ts
│   ├── components/
│   │   └── CanvasWithSprite.tsx   # The main game component
│   ├── App.tsx          # App component
│   ├── main.tsx         # Main React file
│   ├── index.css        # Main React styling
│   └── App.css          # App level styling
├── package.json         # Project metadata
└── README.md            # Documentation
```

---

## 🚀 Gameplay Mechanics

- **Player Movement:**  
  Controlled using keyboard inputs (`ArrowLeft`, `ArrowRight`).

- **Obstacle Behavior:**

  - Each slime moves toward the player at a constant speed.

- **Collision Detection:**
  - When the player (yellow circle) collides with a black box, the box is destroyed and removed from the canvas.

---

## 🎨 Technologies Used

- **React**: For building the UI and managing component state.
- **HTML5 Canvas**: For rendering the game elements.
- **JavaScript**: For implementing game logic, including movement and collision detection.

---

## 🌟 Future Enhancements

- Introduce difficulty levels with faster box speeds.
- Include sound effects and visual animations for collisions.
- Add functionality for pausing and restarting the game.

---

## 🗄️ Screenshot

![Game Screenshot](https://imgur.com/P1dSYNW.png)  
_A simple gameplay experience!_

---

## 🔖 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

**Enjoy the game and happy coding! 🎮**
