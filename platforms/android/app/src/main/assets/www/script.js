class Post{
    constructor(content,priority,id,completed){
        this.content = content;
        this.priority = priority;
        this.id = id;
        this.completed = completed;
    }
}

class Post2{
    constructor(c2,status,date){
        this.c2 = c2;
        this.status = status;
        this.date = date;
    }
}



var app = new Vue ({
    el: "#toAppend",
    data: {
        postList: [],
        
    }
})

var app2 = new Vue ({
    el: "#toAppendHistory",
    data: {
        postList: [],
        
    }
})

document.addEventListener("deviceready", ondeviceready, false);
function ondeviceready(){
    alert("device ready")
    // $("#test").click(function(){
    //     cordova.plugins.notification.local.schedule({
    //         title: 'My first notification',
    //         text: 'Thats pretty easy...',
    //         foreground: true
    //     });
    //     alert("THE BUTTON BE WORKING THO HELLOOOO")

    //     read();
    // })
}

    $(document).ready(function(){
        // localStorage.setItem("id_var", 0);
        // var id_var = localStorage.getItem("id_var");;
        // console.log(id_var);
        var timeLeft = moment().endOf('day').fromNow(true);
        var timeInMins = parseInt(timeLeft,1) * 60 + " mins";
        var timeInSecs = parseInt(timeLeft,10) * 3600 + " secs";
        var test = moment().endOf('6 hours').fromNow();
        var arrayTime = ["5000","15000","25000"];
        console.log(test);
        var currentDate = moment().format('l');   
        
        console.log(currentDate);  
        // console.log(moment().isAfter(currentDate));

        var dt = luxon.DateTime;
        var now = dt.local();
        var leftH = 24 - now.c.hour;
        var leftM = Math.round(1440 - (now.c.minute+(now.c.hour*60)+(now.c.second/60))); 
        var leftS = 86400 - (now.c.second + (now.c.hour*3600)+(now.c.minute*60));

        var leftH_clone = 24 - now.c.hour;
        var leftM_clone = Math.round(1440 - (now.c.minute+(now.c.hour*60)+(now.c.second/60))); 
        var leftS_clone = 86400 - (now.c.second + (now.c.hour*3600)+(now.c.minute*60));
        console.log(dt.local().year + "/"+dt.local().month+ "/"+dt.local().day);
        // selectTime();
        // dayINFO();
        var currentDay = [dt.local().year,dt.local().month,+dt.local().day]
        timeInMinutes();
        function swipeList(){
            setTimeout(() => { $(function() {
                $('.todo').listSwipe();
            });
                
            }, 1000);
        }

        function selectTime(){
            for(i=0;i<=24;i++){
                $(".hourSelect").append('<option value='+i+'>'+i+'</option>')
            }
            for(x=0;x<=59;x++){
                $(".minuteSelect").append('<option value='+x+'>'+x+'</option>')
            }
        }
        
        function dayINFO(p){
            $("#tLeft").text(p);
            $("#date").text(moment().format('dddd, MMMM Do'));
        }


    
        //-----------------------------------Database-------------------------------------------------------
        var request = indexedDB.open("Database",4);


        request.onupgradeneeded = function(event) {
            // The database did not previously exist, so create object stores and indexes.
            var db = request.result;
            
            if(event.oldVersion <1){
                var store = db.createObjectStore("reminders", {keyPath: "id", autoIncrement:true} );
                var contentIndex = store.createIndex("content","content");
                var priorityIndex = store.createIndex("priority","priority");
                var completedIndex = store.createIndex("completed","completed");
            }
            
            
            if(event.oldVersion <2){
                var options = db.createObjectStore("options", {keyPath: "id"});
                var lowIndex = options.createIndex("low","low");
                var mediumIndex = options.createIndex("medium","medium");
                var highIndex = options.createIndex("high","high");
                var timeIndex = options.createIndex("time","time");
            }
            
            if(event.oldVersion <3){
                var history = db.createObjectStore("history", {keyPath: "id", autoIncrement:true});
                var historyIndex = history.createIndex("content","content");
                var historyIndex = history.createIndex("status","status");
                var historyIndex = history.createIndex("date","date");
            }

            if(event.oldVersion <4){
                var cdate = db.createObjectStore("currentDate", {keyPath: "id"});
                var cdateIndex = cdate.createIndex("timeLeft","timeLeft");
            }
            
        
        };

        request.onsuccess = function() {
            db = request.result;
            setCurrentDate(currentDate);
            read();
            readOptions();
            readHistory();
            readDate();
            

        };
        
        
        $("#add").click(function(){
            console.log($("#goal").val());
            console.log("Clicked!");
            add($("#goal").val().trim(), $("#priority").val());
            setTimeout(function(){ $("#goal").val(""); }, 300);
            swipeList();   
            readUpdated();
        })
        
        $(document).on("click",".btest",function(){
            var delB = parseInt($(this).val());
            console.log(delB);
            deleteData(delB);
            swipeList(); 
            console.log("Data deleted");
        });

        $(document).on("click",".check",function(){
            var idVal = parseInt($(this).val());
            var id = $(this).val();
            var contentVal = $(''+"#"+id+""+'').text();
            var priorityVal = $(".squareTEST").val();
            console.log("ID : "+ idVal);
            console.log("ID class : "+ id);
            console.log("Content : "+contentVal);
            console.log("Priority : "+priorityVal);
            updateStatus(contentVal,priorityVal,idVal);
            
            // location.reload();
        })

    
        // $("#testDEL").click(function(){
        //     deleteAllData();
        // })
        $("#saveButton").click(function(){
            var lowHval = $("#lowHval").val().trim();
            var lowMval = $("#lowMval").val().trim();
            var mediumHval = $("#mediumHval").val().trim();
            var mediumMval = $("#mediumMval").val().trim();
            var highHval = $("#highHval").val().trim();
            var highMval = $("#highMval").val().trim();
            var timeVal = $("#optionTime").val().trim();
            var low = lowHval +" "+ lowMval;
            var med = mediumHval +" "+ mediumMval;
            var high = highHval + " "+ highMval;

            setLow(low);
            setMed(med);
            setHigh(high);
            setTime(timeVal);
            console.log("Low val : " +low);
            console.log("Medium val : " +med);
            console.log("High val : " +high);

            setText();
            
            settimeout(() => {
            location.reload();  
            }, 1000);
        })
    

        function add(p1,p2) {
            var request = db.transaction(["reminders"], "readwrite")
            .objectStore("reminders")
            .add({ content: p1, priority:p2, completed: "false"})
            // readUpdated();
            
            request.onsuccess = function(event) {
                console.log("Data has been added to your database.");
            };
        
            request.onerror = function(event) {
                console.log("Unable to add data to db ");
            }
        }

        function addToHistory(p1,p2) {
            var request = db.transaction(["history"], "readwrite")
            .objectStore("history")
            .add({ content: p1, status: p2, date: dt.local().year + "/"+dt.local().month+ "/"+dt.local().day})
            // readUpdated();
            
            request.onsuccess = function(event) {
                console.log("Data has been added to your database.");
            };
        
            request.onerror = function(event) {
                console.log("Unable to add data to db ");
            }
        }

        function setCurrentDate(x){
            var request = db.transaction(["currentDate"], "readwrite")
            .objectStore("currentDate")
            .add({ timeLeft: x ,id:0})
            // readUpdated();
            
            request.onsuccess = function(event) {
                console.log("Data has been added to your database.");
            };
        
            request.onerror = function(event) {
                console.log("Unable to add data to db ");
            }
        }

        function updateCurrentDate(x){
            var request = db.transaction(["currentDate"], "readwrite")
            .objectStore("currentDate")
            .put({ timeLeft: x ,id:0})
            // readUpdated();
            
            request.onsuccess = function(event) {
                console.log("Data has been added to your database.");
            };
        
            request.onerror = function(event) {
                console.log("Unable to add data to db ");
            }
        }

        function checkDate(){
            
        }
        

        function setLow(x){
            var request = db.transaction(["options"], "readwrite")
            .objectStore("options")
            .put({ low: x ,id:0})
            // readUpdated();
            
            request.onsuccess = function(event) {
                console.log("Data has been added to your database.");
            };
        
            request.onerror = function(event) {
                console.log("Unable to add data to db ");
            }
        }
        function setMed(y){
            var request = db.transaction(["options"], "readwrite")
            .objectStore("options")
            .put({ medium: y ,id:1})
            // readUpdated();
            
            request.onsuccess = function(event) {
                console.log("Data has been added to your database.");
            };
        
            request.onerror = function(event) {
                console.log("Unable to add data to db ");
            }
        }
        function setHigh(z){
            var request = db.transaction(["options"], "readwrite")
            .objectStore("options")
            .put({ high: z ,id:2})
            // readUpdated();
            
            request.onsuccess = function(event) {
                console.log("Data has been added to your database.");
            };
        
            request.onerror = function(event) {
                console.log("Unable to add data to db ");
            }
        }
        function setTime(a){
            var request = db.transaction(["options"], "readwrite")
            .objectStore("options")
            .put({ time: a ,id:3})
            // readUpdated();
            
            request.onsuccess = function(event) {
                console.log("Data has been added to your database.");
            };
        
            request.onerror = function(event) {
                console.log("Unable to add data to db ");
            }
        }

        function read() {
            var transaction = db.transaction(["reminders"]);
            var objectStore = transaction.objectStore("reminders");
            var request = objectStore.getAll();
            swipeList();

            request.onerror = function(event) {
                alert("Unable to retrieve data from database!");
            };

        

            request.onsuccess = function(event) {
                
                if(request.result) {
                    var req = request.result;

                    console.log(request.result);
                    for (var x of request.result) {
                        let post = new Post(
                            x.content,
                            x.priority,
                            x.id,
                            x.completed
                            
                        )
                        console.log(x.content);
                        console.log(x.priority);
                        console.log(x.completed);
                        app.postList.push(post)
                    };
                    // console.log("HERE: " +req)
                    
                    for(i=0;i<req.length;i++) {
                        if(req[i].priority === "high"){
                            mynotify(req[i].content +" High priority", arrayTime[2] );
                            notify(req[i].content +" High priority",0,2);
                            console.log("Notif triggered")
                        }

                        else if(req[i].priority === "medium"){
                            mynotify(req[i].content + " Medium priority", arrayTime[1]);
                            notify(req[i].content + " Medium priority", 0,5);
                        }

                        else if(req[i].priority === "low"){
                            mynotify(req[i].content + " Low priority", arrayTime[0]);
                            notify(req[i].content + " Low priority", 0,10);
                            
                        }
                        else{
                            alert("Not working")
                        }
                    }
                    

                } else {
                    alert("No entry"); 

                }
            };
            
        }

        function readHistory() {
            var transaction = db.transaction(["history"]);
            var objectStore = transaction.objectStore("history");
            var request = objectStore.getAll();
            swipeList();
            console.log(request);

            request.onerror = function(event) {
                alert("Unable to retrieve data from database!");
            };

        

            request.onsuccess = function(event) {
    
                if(request.result) {
                    var req = request.result;

                    console.log(request.result);
                    for (var x of request.result) {
                        let post = new Post2(
                            x.content,
                            x.status,
                            x.date,
                            
                        )
                    
                        app2.postList.push(post)
                    };
                }
            };
            
        }

        function readDate() {
            var transaction = db.transaction(["currentDate"]);
            var objectStore = transaction.objectStore("currentDate");
            var request = objectStore.getAll();
            swipeList();
            console.log(request);

            request.onerror = function(event) {
                alert("Unable to retrieve data from database!");
            };

        

            request.onsuccess = function(event) {
                var tleft = request.result[0].timeLeft;
                if(request.result) {
                    console.log("CURRENT DATE : " + tleft);

                }
                console.log(moment(currentDate).isAfter(tleft));
                if (moment(currentDate).isAfter(tleft)){
                    updateCurrentDate(currentDate);
                    deleteAllData();
                    console.log("It's tommorow")
                }
                else {
                    console.log("It is not tomrrow yet")
                }
            };
            
        }

        function deleteData(p) {
            var transaction = db.transaction(["reminders"],"readwrite");
            var objectStore = transaction.objectStore("reminders");
            var request = objectStore.delete(p);
            readUpdated();
            location.reload();

            request.onerror = function(event) {
                alert("Unable to retrieve data from database!");
            };

        

            request.onsuccess = function(event) {
                console.log("Success");          
            }
            
        }

        function deleteAllData() {
            var transaction = db.transaction(["reminders"],"readwrite");
            var objectStore = transaction.objectStore("reminders");
            var request = objectStore.clear();
            // readUpdated();
            addToHistory()
            // location.reload();

            request.onerror = function(event) {
                alert("Unable to retrieve data from database!");
            };

        

            request.onsuccess = function(event) {
                console.log("Success");          
            }
            
        }

        function updateStatus(x,y,z){
            var request = db.transaction(["reminders"], "readwrite")
            .objectStore("reminders")
            .put({content:x ,priority:y ,completed: "true" ,id:z})
            // readUpdated();
            addToHistory(x, "Achieved");
            location.reload();
            
            
            request.onsuccess = function(event) {
                console.log("Data has been added to your database.");
            };
        
            request.onerror = function(event) {
                console.log("Unable to add data to db ");
            }
        }

        

        function readOptions() {
            var transaction = db.transaction(["options"]);
            var objectStore = transaction.objectStore("options");
            var request = objectStore.getAll();

            request.onerror = function(event) {
                alert("Unable to retrieve data from database!");
            };

        

            request.onsuccess = function(event) {
                
    
                if(request.result) {
                    console.log(request.result);
                    var reqOption = request.result
                    
                    if(reqOption[3].time === "Hours"){
                        timeInHours();
                        
                    }
                    else if(reqOption[3].time === "Minutes"){
                        timeInMinutes();
                    }
                    else if(reqOption[3].time === "Seconds"){
                        timeInSeconds();
                    }

                

                    var lowTime = request.result[0].low;
                    var lowSplit =  lowTime.split(" ");
                    var lowHHH = (parseInt(lowSplit[0]));
                    var lowMMM = (parseInt(lowSplit[1]));
                    var low = (lowHHH*3600)+(lowMMM*60);
                    console.log(lowHHH);

                    var mediumTime = request.result[1].medium;
                    var mediumSplit =  mediumTime.split(" ");
                    var mediumHHH = (parseInt(mediumSplit[0]));
                    var mediumMMM = (parseInt(mediumSplit[1]));
                    var medium = (mediumHHH*3600)+(mediumMMM*60);
                    // console.log(medium);

                    var highTime = request.result[2].high;
                    var highSplit =  highTime.split(" ");
                    var highHHH = (parseInt(highSplit[0]))
                    var highMMM = (parseInt(highSplit[1]));
                    var high = (highHHH*3600)+(highMMM*60);
                    // console.log(high);

                    
                    

                    // if($("option").text("NaN")){
                    //     $(".hour").text("Hours");
                    //     $(".minute").text("Minutes");
                    // }

                    function setText(){
                        $("#val01").text(lowHHH);
                        $("#val02").text(lowMMM);
                        $("#val03").text(mediumHHH);
                        $("#val04").text(mediumMMM);
                        $("#val05").text(highHHH);
                        $("#val06").text(highMMM);
                        $("#val07").text(reqOption[3].time);
                
                        selected();
                    }
                    setText();
                    selected();
                    
                    
                    
                    
                    
                };
            }
            
        }

        function readUpdated() {
            var transaction = db.transaction(["reminders"]);
            var objectStore = transaction.objectStore("reminders");
            var request = objectStore.getAll();

            request.onerror = function(event) {
                alert("Unable to retrieve data from database!");
            };

        

            request.onsuccess = function(event) {
    
                if(request.result) {
                    console.log(request.result);
                    var updated = request.result.pop();
                    console.log(updated);
                    let post = new Post(updated.content,updated.priority,updated.id,updated.completed);
                    app.postList.push(post);
                    console.log(updated.content);
                    swipeList();
                    

                } else {
                    alert("No entry"); 

                }
            };
            
        }

        $("#btn2").click(function(){
            notify2();
        });
        $("#btn").click(function(){
            mynotify();
        })
        


        function notify(p1,p2,p3){
            cordova.plugins.notification.local.schedule({
                title: 'Remember...regular',
                text: p1,
                trigger: { every: { hour: parseInt(p2), minute: parseInt(p3) } }
            });
        }

        function notify2(){
            cordova.plugins.notification.local.schedule({
                title: 'Remember',
                text: 'Hello World <3',
                foreground: true
            });
        }

        function mynotify(p1,p2){
            setInterval(() => {
                cordova.plugins.notification.local.schedule({
                    title: 'Remember... -Test with settime',
                    text: p1,
                    foreground: true
                });
            }, parseInt(p2));
        }

        function timeInSeconds(){
            dayINFO(leftS + " seconds");
            setInterval(() => {
                leftS--;
                dayINFO(leftS + " seconds");
                if(leftS == 0){
                    leftS = 86400;
                }
            }, 1000);
        }
        function timeInMinutes(){
            dayINFO(leftM + " minutes");
            setInterval(() => {
                leftM--;
                dayINFO(leftM + " minutes");
                if(leftM == 0){
                    leftM = 1440;
                }
            }, 60000);
        }
        function timeInHours(){
            dayINFO(leftH + " hours");
            setInterval(() => {
                leftH--;
                dayINFO(leftH + " hours");
                if(leftH == 0){
                    leftH = 24;
                }
            }, 3600000);
        }

        function selected(){
            var optionValuesLH =[];
            var optionValuesLM =[];
            var optionValuesMH =[];
            var optionValuesMM =[];
            var optionValuesHH =[];
            var optionValuesHM =[];
            var optionValuesT =[];

            $('#lowHval option').each(function(){
                if($.inArray(this.value, optionValuesLH) >-1){
                    $(this).remove()
                }else{
                    optionValuesLH.push(this.value);
                }
            });

            $('#lowMval option').each(function(){
                if($.inArray(this.value, optionValuesLM) >-1){
                    $(this).remove()
                }else{
                    optionValuesLM.push(this.value);
                }
            });

            $('#mediumHval option').each(function(){
                if($.inArray(this.value, optionValuesMH) >-1){
                    $(this).remove()
                }else{
                    optionValuesMH.push(this.value);
                }
            });

            $('#mediumMval option').each(function(){
                if($.inArray(this.value, optionValuesMM) >-1){
                    $(this).remove()
                }else{
                    optionValuesMM.push(this.value);
                }
            });

            $('#highHval option').each(function(){
                if($.inArray(this.value, optionValuesHH) >-1){
                    $(this).remove()
                }else{
                    optionValuesHH.push(this.value);
                }
            });

            $('#highMval option').each(function(){
                if($.inArray(this.value, optionValuesHM) >-1){
                    $(this).remove()
                }else{
                    optionValuesHM.push(this.value);
                }
            });

            $('#optionTime option').each(function(){
                if($.inArray(this.value, optionValuesT) >-1){
                    $(this).remove()
                }else{
                    optionValuesT.push(this.value);
                }
            });
        }

        
        //--------------css---------------------------------------------------------------------
        function removeALL(){
            $("#active-tab").css("background-color","white");
            $("#history-tab").css("background-color","white");
            $("#settings-tab").css("background-color","white");
            $("#active-icon").css("color","black");
            $("#history-icon").css("color","black");
            $("#settings-icon").css("color","black");
            $(".menu-text").css("color","black");
            $(".tab-pane").removeClass("active");
        }

        $("#active-tab").click(function(){
            removeALL();
            setTimeout(() => {
                $("#active").addClass("active");
                $("#active-tab").css("background-color","#E91E63"); 
                $("#active-icon").css("color","white"); 
                $("#active-text").css("color","white"); 
                $("#buttonRow").css("visibility","visible");
            }, 10);
        })
        $("#history-tab").click(function(){
            removeALL();
            setTimeout(() => {
                $("#history").addClass("active");
                $("#history-tab").css("background-color","#E91E63");
                $("#history-text").css("color","white"); 
                $("#history-icon").css("color","white");  
                $("#buttonRow").css("visibility","hidden");
            }, 10);
        })
        $("#settings-tab").click(function(){
            removeALL();
            setTimeout(() => {
                $("#settings").addClass("active");
                $("#settings-tab").css("background-color","#E91E63"); 
                $("#settings-text").css("color","white"); 
                $("#settings-icon").css("color","white"); 
                $("#buttonRow").css("visibility","hidden");
            }, 10);
        })
    })