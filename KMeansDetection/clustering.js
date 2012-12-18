$(document).ready(function() {
    var imageField = document.getElementById("picture");
    var ctx = imageField.getContext('2d');
    
    var pictures = [];
    var mouseFlag = false;
    
    ClearDrawingArea();
    
    $("#picture").mousedown( MouseDrawStart );
    $("#picture").mousemove( MouseDraw );
    $(document).mouseup( MouseDrawEnd );
    $("#clearButton").click( ClearDrawingArea );
    $("#addButton").click( AddPicture );
    $("#clusteringForm").submit( Clustering );
    $("#resetButton").click( ResetData );
    
    function MouseDrawStart( event )
    {
        mouseFlag = true;
        ctx.fillRect(event.offsetX, event.offsetY, 5, 5);
    }
    
    function MouseDraw( event )
    {
        if (mouseFlag) {
            ctx.fillRect(event.offsetX, event.offsetY, 5, 5);
        }
    }
    
    function MouseDrawEnd( event )
    {
        mouseFlag = false;
    }
    
    function ClearDrawingArea()
    {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, imageField.width, imageField.height);
        ctx.fillStyle = "black";
    }
    
    function AddPicture( )
    {
        pictures.push(imageField.toDataURL() );
        ClearDrawingArea();
    }
    
    function ResetData( )
    {
        pictures = [];
        ClearDrawingArea();
        $("#numberOfClusters").val("");
    }
    
    function MakingPixelMap( pict )
    {
        var map = [];
        var pixelMap = ctx.getImageData(0, 0, imageField.width, imageField.height).data;
        for (var i=0; i < pixelMap.length; i+=4) {
            if (pixelMap[i] == 255 && pixelMap[i+1] == 255 && pixelMap[i+2] == 255) { 
                map.push(0);
            } else {
                map.push(1);
            }   
        }
        return map;
    }
    
    function Clustering( )
    {
        var num = $("#numberOfClusters").val();
        var clusters;
        var clusterCenters = [];
        var newClusters = {};
        var moveFlag = true;
        var closestCluster;
        var distances = [];
        if (num > pictures.length) {
            return;
        }
        var clusters = CreateClusterParts(num);
        while (moveFlag) { //Написать условие!!!
            moveFlag = false;
            clusterCenters = CountCenters( clusters );
            newClusters = {};
            $.each( clusters, function(clusterNum, cluster)
            {
                $.each(cluster, function(index, pict)
                {
                    for (var i=1; i< clusterCenters.length; i++ ) {
                        distances[i] = EuclideanDistance(pict[2], clusterCenters[i]);
                    }
                    closestCluster = FindMin( distances );
                    if ( closestCluster != clusterNum ) {
                        moveFlag = true;
                    }
                    newClusters[closestCluster].push( pict );
                });
            }); 
            clusters = newClusters;
        }
        ShowPictures( clusters );
        return false;
    }
    
    function ShowPictures( clusters )
    {
        $.each(clusters, function( index, clstr)
        {
            $("#outputDiv").append( index );
            $.each( clstr, function(num,picture)
            {
                $("#outputDiv").append("<img src="+picture[1]+">");
            })
        });
    }
    
    function FindMin( distance )
    {
        var min = distance[1];
        var num = 1;
        for (var i=2; i<distance.length; i++) {
            if (distance[i] < min ) {
                min = distance[i];
                num = i;
            }
        }
        return num;
    }
    
    function EuclideanDistance( map1, map2 )
    {
        var sum = 0;
        for( var i=0; i<map1.length; i++) {
                sum+= Math.pow(map1[i]-map2[i], 2);
            }
        return Math.sqrt(sum);
    }
    
    function CountCenters ( clusters )
    {
        var centers = [];
        $.each( clusters , function(clusterNum, cluster)
        {
            var cntr = [];
            var pictureLength = cluster[1][2].length;
            for (var i=0; i<pictureLength; i++)
                cntr.push(0);
            $.each( cluster, function(index, pict)
            {
                for (var i=0; i< pictureLength; i++) {
                    cntr[i] += pict[2][i];
                }
            });
            for (var i=0; i<pictureLength; i++ )
                cntr[i] /= cluster.length;
            centers[clusterNum] = cntr;
        });
        return centers;
    }
    
    function CreateClusterParts( num )
    {
        var clusters = {};
        var clstr = {};
        var index = 1;
        for (var i=0; i < pictures.length; i++) {
            clstr = clusters[ i % num + 1 ];
            if (clstr == undefined ) {
                clstr ={};
            }
            clstr[ index ] = {
                1:pictures[i], 
                2:MakingPixelMap( pictures[i] ) };
            index++;
            clusters[ i % num + 1 ] = clstr;
        }
        return clusters;
    }
}
);
