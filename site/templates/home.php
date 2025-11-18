<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Miguel Robitzky</title>
    <link rel="stylesheet" href="/assets/styles/style.css">
</head>
<body class="start-menu-opened">
    <div class="background-image">
        <img src="/assets/images/TooManyTabs.png" alt="Background Image">
    </div>
    <div class="website-title-container">
        <div class="title-element">Miguel Robitzky</div>
    </div>
    <?php snippet('start-menu') ?>
    <?php snippet('content-scroller') ?>
    <!-- Container for cloned images - mask applied via CSS, populated by snippet -->
    <?php snippet('content-scroller-clones') ?>
    </body>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
<script src="/assets/scripts/helper.js"></script>
<script src="/assets/scripts/startMenuMobile.js"></script>
<script src="/assets/scripts/startMenuDesktop.js"></script>
<script src="/assets/scripts/contentScrollerDesktop.js"></script>
<script src="/assets/scripts/contentScrollerMobile.js"></script>
<script src="/assets/scripts/numberContainerClick.js"></script>
<script src="/assets/scripts/websiteTitleClick.js"></script>
<script src="/assets/scripts/imagePositioning.js"></script>
<script src="/assets/scripts/textPositioning.js"></script>
<script src="/assets/scripts/imageCarousel.js"></script>
</html>