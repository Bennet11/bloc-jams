var animatePoints = function() {
    
    var points = document.getElementsByClassName('point');
                
    var revealPoint = function(index) {
        points[index].style.opacity = 1;
        points[index].style.transform = "rotate(90deg)";
        points[index].style.mstransform = "rotate(90deg)";
        points[index].style.WebkitTransform = "rotate(90deg)";
    }
    
    for (var i = 0; i < 3; i++) {
        revealPoint(i);   
    }
};

