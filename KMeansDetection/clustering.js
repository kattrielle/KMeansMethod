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
    $("#makeButton").click( Clustering );
    $("resetButton").click( ResetData );
    
    function MouseDrawStart( event )
    {
        MouseFlag = true;
        ctx.fillRect(event.offsetX, event.offsetY, 5, 5);
    }
    
    function MouseDraw( event )
    {
        if (MouseFlag) {
            ctx.fillRect(event.offsetX, event.offsetY, 5, 5);
        }
    }
    
    function MouseDrawEnd( event )
    {
        MouseFlag = false;
    }
    
    function ClearDrawingArea()
    {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, imageField.width, imageField.height);
        ctx.fillStyle = "black";
    }
    
    function AddPicture( )
    {
        pictures.push(ImageField.toDataURL() );
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
        var clusters = {};
        var clusterCenters = [];
        var newClusters = {};
        var MoveFlag = ruet;
        if (num == undefined ) {
            return;
        }
        if (num > pictures.length) {
            return;
        }
        clusters = CreateClusterParts(num);
        while (true) { //Написать условие!!!
            clusterCenters = CountCenters( clusters );
            newClusters = RedefineClusters( clusters, clusterCenters );
            //Где и как переприсвоить кластеры?
        }
        ShowPictures( clusters );
    }
    
    function ShowPictures( clusters )
    {
        
    }
    
    function RedefineClusters( clusters, centers )
    {
        var newClusters = {};
        var closestCluster;
        var distances = [];
        $.each( clusters, function(clusterNum, cluster)
        {
            $.each(cluster, function(index, pict)
            {
                for (var i=1; i< centers.length; i++ ) {
                    distances[i] = EuclideanDistance(pict[2], centers[i]);
                }
                closestCluster = FindMin( distances );
                newClusters[closestCluster].push( pict );
            });
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
        for( var i=0; i<imageField.height; i++)
            for( var j=0; j<imageField.width; j++) {
                sum+= Math.pow(map1[i][j]-map2[i][j], 2);
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
        for (var i=0; i < pictures.length; i++) {
            clstr = clusters[ i % num + 1 ];
            clstr.push( {
                1:pictures[i], 
                2:MakingPixelMap( pictures[i] )
            } );
            clusters[ i % num + 1 ] = clstr;
        }
        return clusters;
    }
}
);
