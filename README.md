# React Canvas Game 🎮

A simple 2D game created with React and HTML5 Canvas. The player, represented by a **small baby sprite**, moves horizontally to collide with **gold coins**. Golden coins move toward the player, and when a collision occurs, the coin is destroyed, 1 is added to score.

---

## 🔠 Features

- **Player Movement:** Use the keyboard to move the player horizontally across the canvas.
- **Points Generation:** gold coins appear dynamically and move toward the player.
- **Collision Detection:** Destroy coin when they collide with the player.
- **Gameplay Limit:** 100px between coin spawn.
- **Infinite Generation:** Trees, coins and boxes are infinitely generated.

---

## 📚 How to Play

1. Use the **arrow keys** keys to move the running baby.
2. Destroy coins by making contact with them.
3. Make sure to avoid wooden boxes that will block path.

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

  - Each box moves toward the player at a constant speed.

- **Collision Detection:**
  - When the player collides with a box, the player is pushed, game will end when player is out of screen.

---

## 🎨 Technologies Used

- **React**: For building the UI and managing component state.
- **HTML5 Canvas**: For rendering the game elements.
- **JavaScript**: For implementing game logic, including movement and collision detection.

---

## 🌟 Future Enhancements

- Introduce difficulty levels with faster box speeds.
- Include sound effects and visual animations for collisions.
- Add better generation of levels.

---

## 🗄️ Screenshot

![Game Screenshot](https://i.imgur.com/wPKaJNL.png)  
_A simple gameplay experience!_

---

## 🔖 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

**Enjoy the game and happy coding! 🎮**
