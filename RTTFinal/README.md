# Rick-Tac-Toe Game

A fun Tic-Tac-Toe game with Rick and Morty theme!

## Features
- Single Player vs CPU
- Two Player mode
- Dice roll to determine who goes first
- Persistent leaderboard tracking wins/losses
- Custom graphics and animations
- Turn indicator system

## Requirements
- Windows OS
- .NET Framework 4.7.2 or higher
- Visual Studio 2019 or later (for development)

## How to Build
1. Open `CSC240-ProjectTicTacToe-LDM.sln` in Visual Studio
2. Build the solution (F6)
3. The executable will be in the project root folder: `RickTacToe.exe`
4. Make sure the `Resources` folder is in the same directory as the .exe file

## How to Play
1. Run `RickTacToe.exe`
2. Enter player names
3. Choose 1 Player (vs CPU) or 2 Player mode
4. Click "Roll Dice" to determine who goes first
5. Click "Start" to begin the game
6. Click on empty squares to make your move
7. First player to get 3 in a row wins!

## Files Included
- All source code (.cs files)
- Designer files and resources (.Designer.cs, .resx)
- Project configuration files (.csproj, .sln, App.config)
- Game images and icons (Resources folder)
- Assembly information (Properties folder)

## Building for Distribution
1. Build in **Release** mode
2. Copy `RickTacToe.exe` and the `Resources` folder together
3. Include `RickTacToe.exe.config` if generated
4. Package as ZIP for distribution

## Notes
- Leaderboard data is saved to `leaderboard.txt` in the same folder as the executable
- The game will create this file automatically on first run
- Exit countdown is 10 seconds (configurable in ExitScreen.cs)

---

**Developed for CSC240 Visual Programming Course**
