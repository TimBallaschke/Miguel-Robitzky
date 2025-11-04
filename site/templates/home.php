<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Miguel Robitzky</title>
    <link rel="stylesheet" href="/assets/styles/style.css">
</head>
<body>
    <div class="content-container" x-data="{ activeItem: null }">
        <!-- <div class="start-menu" :class="{ 'content-unfolded': activeItem !== null }">
            <div id="start-menu-item-1" 
                 class="start-menu-item"
                 :class="{ 'unfolded': activeItem !== null && activeItem >= 1, 'folded': activeItem !== null && activeItem !== 1, 'clicked-menu-item': activeItem === 1 }"
                 @click="activeItem = 1">
                 <div class="start-menu-item-button"></div>
                 <div class="start-menu-item-placeholder-after"></div>
            </div>
            <div id="start-menu-item-2" 
                 class="start-menu-item"
                 :class="{ 'unfolded': activeItem !== null && activeItem >= 2, 'folded': activeItem !== null && activeItem !== 2, 'clicked-menu-item': activeItem === 2 }"
                 @click="activeItem = 2">
                 <div class="start-menu-item-placeholder-before"></div>
                 <div class="start-menu-item-button"></div>
                 <div class="start-menu-item-placeholder-after"></div>
            </div>
            <div id="start-menu-item-3" 
                 class="start-menu-item"
                 :class="{ 'unfolded': activeItem !== null && activeItem >= 3, 'folded': activeItem !== null && activeItem !== 3, 'clicked-menu-item': activeItem === 3 }"
                 @click="activeItem = 3">
                 <div class="start-menu-item-placeholder-before"></div>
                 <div class="start-menu-item-button"></div>
                 <div class="start-menu-item-placeholder-after"></div></div>
            <div id="start-menu-item-4" 
                 class="start-menu-item"
                 :class="{ 'unfolded': activeItem !== null && activeItem >= 4, 'folded': activeItem !== null && activeItem !== 4, 'clicked-menu-item': activeItem === 4 }"
                 @click="activeItem = 4">
                 <div class="start-menu-item-placeholder-before"></div>
                 <div class="start-menu-item-button"></div>
                 <div class="start-menu-item-placeholder-after"></div>
            </div>
        </div> -->
        <div class="scroller">
            <div id="inner-scroller-1" class="inner-scroller"></div>
            <div id="inner-scroller-2" class="inner-scroller"></div>
            <div id="inner-scroller-3" class="inner-scroller"></div>
            <div id="inner-scroller-4" class="inner-scroller"></div>
        </div>
        <div class="numbers">
            <div id="number-1" class="number" data-scroller="inner-scroller-1">1</div>
            <div id="number-2" class="number" data-scroller="inner-scroller-2">2</div>
            <div id="number-3" class="number" data-scroller="inner-scroller-3">3</div>
            <div id="number-4" class="number" data-scroller="inner-scroller-4">4</div>
        </div>
    </div>
    <div class="numbers-container"></div>
    </body>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
<script src="/assets/scripts/script.js"></script>
</html>