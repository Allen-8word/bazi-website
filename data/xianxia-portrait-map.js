(function () {
  'use strict';

  const portraitMap = {
    '甲': {
      male: {
        src: './assets/share-card-portraits/jia-male.png',
        alt: '甲木男性修仙命格圖像'
      },
      female: {
        src: './assets/share-card-portraits/jia-female.png',
        alt: '甲木女性修仙命格圖像'
      }
    }
  };

  function getPortrait(dayStem, gender) {
    const normalizedGender = gender === 'female' ? 'female' : 'male';
    return (portraitMap[dayStem] && portraitMap[dayStem][normalizedGender]) || null;
  }

  window.XIANXIA_PORTRAIT_MAP = {
    portraitMap,
    getPortrait
  };
})();
