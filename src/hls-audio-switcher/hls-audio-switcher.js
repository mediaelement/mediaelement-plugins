"use strict";

const icon =  `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>`;
const dummyLabel = "switch audio";

/**
 * [Name of feature]
 *
 * [Description]
 */

// If plugin needs translations, put here English one in this format:
// mejs.i18n.en["mejs.id1"] = "String 1";
// mejs.i18n.en["mejs.id2"] = "String 2";

// Feature configuration
Object.assign(mejs.MepDefaults, {
  // Any variable that can be configured by the end user belongs here.
  // Make sure is unique by checking API and Configuration file.
  // Add comments about the nature of each of these variables.
});

Object.assign(MediaElementPlayer.prototype, {
  // Public variables (also documented according to JSDoc specifications)

  /**
   * Feature constructor.
   *
   * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
   * @param {MediaElementPlayer} player
   * @param {HTMLElement} controls
   * @param {HTMLElement} layers
   * @param {HTMLElement} media
   */
  buildhlsaudioswitcher(player, controls, layers, media) {
    // This allows us to access options and other useful elements already set.
    // Adding variables to the object is a good idea if you plan to reuse
    // those variables in further operations.
    this.initiated = false;

    media.addEventListener("loadedmetadata", () => {
      // Prevent multiple buttons:
      if (this.initiated) {
        return;
      }

      this.initButton(player.media.hlsPlayer);

      player.media.hlsPlayer.audioTrack = 3;
      this.initiated = true;
    });
  },

  initButton(hlsPlayer) {
    const classPrefix = this.options.classPrefix;
    const inputClass = `${classPrefix}audio-tracks-selector-input`;
    const tracks = hlsPlayer.audioTrackController.tracks;

    const button = document.createElement("div");
    button.className = `${classPrefix}button ${classPrefix}hls-audio-switcher-button`;
    button.innerHTML = `<button type="button" aria-controls="${this.id}" title="${dummyLabel}" aria-label="${dummyLabel}" tabindex="0">${icon}</button>`;

    const popover = document.createElement("div");
    const ul = document.createElement("ul");
    popover.appendChild(ul);
    popover.className = `${classPrefix}popover ${classPrefix}hls-audio-switcher-popover`;

    console.table(tracks);

    // FIXME: only iterate relevant group.
    tracks.forEach((audioTrack, index) => {
      const track = `${audioTrack.groupId}_${audioTrack.id}_${index}`;
      const inputName = `${this.id}_audio-tracks`;
      const selectedClass = audioTrack.default
        ? ` ${classPrefix}audio-tracks-selected`
        : "";
      const labelClass = `${classPrefix}audio-tracks-selector-label
          ${selectedClass}`;

      const li = document.createElement("li");
      li.classList.add(`${classPrefix}audio-tracks-selector-list-item`);
      li.innerHTML = `<input class="${inputClass}" type="radio" name="${inputName}"
          value="${audioTrack.id}" id="${track}"
          ${audioTrack.default ? ' checked="checked"' : ""}/>
          <label for="${track}" class="${labelClass}">
          ${audioTrack.name}
          </label>`;
      ul.appendChild(li);

      const radio = li.querySelector("input[type=radio]");
      radio.addEventListener('change', (event) => {
        event.stopPropagation();
        event.preventDefault();
        hlsPlayer.audioTrack = parseInt(event.target.value, 10);
        console.log("switched audio track", hlsPlayer.audioTrack);
      });
    });

    button.append(popover);

    this.addControlElement(button, "hlsaudioswitcher");

    button.addEventListener("click", () => {
      button.classList.toggle("js-active");
    });
  },

  // Optionally, each feature can be destroyed setting a `clean` method

  /**
   * Feature destructor.
   *
   * Always has to be prefixed with `clean` and the name that was used in MepDefaults.features list
   * @param {MediaElementPlayer} player
   * @param {HTMLElement} controls
   * @param {HTMLElement} layers
   * @param {HTMLElement} media
   */
  cleanhlsaudioswitcher() {
    console.log("clean destroy");
  },

  // Other optional public methods (all documented according to JSDoc specifications)
});
