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
    },
    '乙': {
      male: {
        src: './assets/share-card-portraits/yi-male.png',
        alt: '乙木男性修仙命格圖像'
      },
      female: {
        src: './assets/share-card-portraits/yi-female.png',
        alt: '乙木女性修仙命格圖像'
      }
    },
    '丙': {
      male: {
        src: './assets/share-card-portraits/bing-male.png',
        alt: '丙火男性修仙命格圖像'
      },
      female: {
        src: './assets/share-card-portraits/bing-female.png',
        alt: '丙火女性修仙命格圖像'
      }
    },
    '丁': {
      male: {
        src: './assets/share-card-portraits/ding-male.png',
        alt: '丁火男性修仙命格圖像'
      },
      female: {
        src: './assets/share-card-portraits/ding-female.png',
        alt: '丁火女性修仙命格圖像'
      }
    },
    '戊': {
      male: {
        src: './assets/share-card-portraits/wu-male.png',
        alt: '戊土男性修仙命格圖像'
      },
      female: {
        src: './assets/share-card-portraits/wu-female.png',
        alt: '戊土女性修仙命格圖像'
      }
    },
    '己': {
      male: {
        src: './assets/share-card-portraits/ji-male.png',
        alt: '己土男性修仙命格圖像'
      },
      female: {
        src: './assets/share-card-portraits/ji-female.png',
        alt: '己土女性修仙命格圖像'
      }
    },
    '庚': {
      male: {
        src: './assets/share-card-portraits/geng-male.png',
        alt: '庚金男性修仙命格圖像'
      },
      female: {
        src: './assets/share-card-portraits/geng-female.png',
        alt: '庚金女性修仙命格圖像'
      }
    },
    '辛': {
      male: {
        src: './assets/share-card-portraits/xin-male.png',
        alt: '辛金男性修仙命格圖像'
      },
      female: {
        src: './assets/share-card-portraits/xin-female.png',
        alt: '辛金女性修仙命格圖像'
      }
    },
    '壬': {
      male: {
        src: './assets/share-card-portraits/ren-male.png',
        alt: '壬水男性修仙命格圖像'
      },
      female: {
        src: './assets/share-card-portraits/ren-female.png',
        alt: '壬水女性修仙命格圖像'
      }
    },
    '癸': {
      male: {
        src: './assets/share-card-portraits/gui-male.png',
        alt: '癸水男性修仙命格圖像'
      },
      female: {
        src: './assets/share-card-portraits/gui-female.png',
        alt: '癸水女性修仙命格圖像'
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
