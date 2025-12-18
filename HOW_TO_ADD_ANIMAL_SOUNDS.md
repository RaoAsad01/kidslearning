# How to Add Your Animal Sound MP3 Files

## Step 1: Place Your MP3 Files

1. Put your MP3 files in the `assets/sounds/` folder
2. Name them exactly as shown below (lowercase, matching the animal ID):

```
assets/sounds/
  ├── dog.mp3
  ├── cat.mp3
  ├── cow.mp3
  ├── pig.mp3
  ├── sheep.mp3
  ├── horse.mp3
  ├── duck.mp3
  ├── chicken.mp3
  ├── rooster.mp3
  ├── owl.mp3
  ├── frog.mp3
  ├── bird.mp3
  ├── lion.mp3
  ├── tiger.mp3
  ├── elephant.mp3
  ├── monkey.mp3
  ├── bear.mp3
  ├── rabbit.mp3
  ├── mouse.mp3
  ├── snake.mp3
  ├── whale.mp3
  ├── dolphin.mp3
  ├── giraffe.mp3
  ├── zebra.mp3
  ├── panda.mp3
  ├── koala.mp3
  ├── shark.mp3
  ├── turtle.mp3
  └── crab.mp3
```

## Step 2: Update the animalSounds.js File

1. Open `src/services/animalSounds.js`
2. Uncomment the lines for the animals you have sound files for
3. For example, if you have `dog.mp3`, uncomment this line:

```javascript
'dog': require('../../assets/sounds/dog.mp3'),
```

## Step 3: Restart the App

After adding files and updating `animalSounds.js`:
1. Stop the Expo server (Ctrl+C)
2. Restart with: `npx expo start --clear`
3. The app will bundle your new sound files

## Example

If you have `dog.mp3`, `cat.mp3`, and `lion.mp3`:

1. Copy them to `assets/sounds/` folder
2. In `src/services/animalSounds.js`, uncomment:
   ```javascript
   'dog': require('../../assets/sounds/dog.mp3'),
   'cat': require('../../assets/sounds/cat.mp3'),
   'lion': require('../../assets/sounds/lion.mp3'),
   ```
3. Restart the app

## Alternative: Use Online URLs

If you prefer to host files online, use `animalSoundUrls` in `animalSounds.js`:

```javascript
export const animalSoundUrls = {
  'dog': 'https://your-server.com/sounds/dog.mp3',
  'cat': 'https://your-server.com/sounds/cat.mp3',
};
```

## Notes

- File names must match exactly (case-sensitive)
- Only add sounds for animals you have files for
- The app will use text-to-speech as fallback for missing sounds
- After adding files, you may need to clear cache: `npx expo start --clear`

