# Tetris
My attempt at re-creating the game of tetris with javascript.

Main takeaways:

|| Using classes to streamline construction of objects
  - Using classes to create the shape objects allows them to share similar methods and properties
  - This makes the code more flexible and reusable as well, as new methods can easily be added to all of the shapes, and new shapes can be easily added

|| Using setTimeout() and setInterval()
  - The setTimeout() and setInterval() methods were necessary for timing events in the game
  - This project helped me clarify my understanding of how to clear the time/intervals; I learnt to set the timeout to a global variable, making it easy to clear the timer from anywhere in the code

|| Using HTML canvas elements;
  - Learning how to use HTML canvas allows greater flexibility in creating shapes and visual interfaces
  - Using canvas with javascript allows me to create graphics responsively, customisiing the display according to my code

A functioning game can be found at https://codepen.io/LeslieYip/full/wvqKNox.
