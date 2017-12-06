var app = angular.module("blankApp", ["ngRoute", "ngCookies", "ngSanitize"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "main.htm"
    })
    .when("/gallery", {
        templateUrl : "gallery.htm"
    })
    .when("/blog", {
        templateUrl : "blog.htm"
    })
    .when("/reviews", {
        templateUrl : "reviews.htm"
    });
});

app.directive("scrollReaction", function ($window, $document) {
    return function (scope, element, attributes) {
        $document.on('scroll', function() {
            var header = angular.element(document.querySelector(".main-header"));
            var nav = angular.element(document.querySelector(".main-nav"));
            var gotoTopButton = angular.element(document.querySelector(".goto"));
            if ($window.scrollY >= 30) {
//                header.css("display", "none");
//                nav.addClass("navbar-fixed-top");
                gotoTopButton.css("display", "block");
            } else {
//                header.css("display", "block");
//                nav.removeClass("navbar-fixed-top");
                gotoTopButton.css("display", "none");
            }

        });
    }
});



app.controller('blankCtrl', ['$scope', '$http', '$cookies','$cookieStore', '$location', 
    function($scope,  $http, $cookies, $cookieStore, $window, $document, $location) {

    $scope.scrollTo = function (id) {
         function scrollUp() {
            window.scrollBy(0,-40); 
            if (window.pageYOffset > 0) {
                requestAnimationFrame(scrollUp);
            } 
        }
        scrollUp();
    }

    $scope.cancelReg = function() {
        $scope.newUser = {};
        $scope.user = {};
        $scope.logError = false;
        $scope.logCurrentView = 'login';
        console.log('cancelReg');
    }

    $scope.cancelReg();

    if ($cookies.userName) {
        console.log('Set cookies');
        $scope.user = { name: $cookies.userName, 
                        firstName: $cookies.firstName,
                        lastName: $cookies.lastName, 
                        email: $cookies.userEmail,
                        password: $cookies.userPassword,
                        useCookies: true
        };
        console.log('Cookies are set')
        $scope.logCurrentView = 'welcome';  // set view!!
    } else {
        $scope.logCurrentView = 'login';  // set view!
    };

    $scope.blogCurrentView = 'read';

    $scope.categShowAll = true;
    var windowWidth = document.documentElement.clientWidth;
    var showItem;
    (windowWidth >= 1000) ? showItem = 3 : (
        (windowWidth >= 770) ? showItem = 2 : showItem = 1); 

    $scope.pagination = {
        showItemNumb0: showItem,
        showItemNumb: 0,
        startItem: 0,
        endItem: 0,
        totalItemNumb: 0,
        filteredItemNumb: 0
    };

    substrJSON = function (data) {
        var ind1 = data.indexOf('[');  //find JSON formatting data
        var ind2 = data.indexOf('{');
        if (ind1 >= 0) {  
                return data.substring(ind1);
            } else {
                if (ind2 >= 0) {
                    return data.substring(ind2);
                }
        }
        if ( ind1<0 && ind2<0) data = '{}';
        return data;  
    }

    $scope.readCategory = function() {
        $http.get('db/readcategory.php').then(
            function onSuccess(response) {
                console.log ('Read category from db');
                console.log(`responce: response.status = ${response.status}`);
                var data = response.data;
                $scope.category = data;
                console.log('Number of categories = ' + $scope.category.length);
                $scope.categShow = [];
                $scope.pagination.totalItemNumb = 0;
                for (var i=0; i<$scope.category.length; i++) {
                    $scope.categShow[i] = true;
                    $scope.category[i].numberOfItems = Number($scope.category[i].numberOfItems);
                    $scope.pagination.totalItemNumb += $scope.category[i].numberOfItems;
                }
            }, 
            function onError(response) {
                console.log(`responce: response.status = ${response.status}`);
                console.log(`responce: response.statustext = ${response.statustext}`);
            }
        );
    }



    $scope.showPrevious = function() {
        console.log ('showPrevious');
        if ($scope.pagination.startItem > 0) {
            $scope.pagination.startItem -= $scope.pagination.showItemNumb;
            if ($scope.pagination.startItem < 0) $scope.pagination.startItem = 0;
            $scope.pagination.endItem = $scope.pagination.startItem + $scope.pagination.showItemNumb - 1;
        }
    }

    $scope.showFirst = function() {
        console.log ('showFirst');
        $scope.pagination.startItem = 0;
        $scope.pagination.endItem = $scope.pagination.startItem + $scope.pagination.showItemNumb - 1;
    }

    $scope.showNext = function() {
        console.log ('showNext');
        if ($scope.pagination.endItem < ($scope.pagination.filteredItemNumb)) {
            $scope.pagination.startItem += $scope.pagination.showItemNumb;
            $scope.pagination.endItem = $scope.pagination.startItem + $scope.pagination.showItemNumb - 1;
            if ($scope.pagination.endItem >= ($scope.pagination.filteredItemNumb)) {
                $scope.pagination.startItem = $scope.pagination.filteredItemNumb - $scope.pagination.showItemNumb;
                $scope.pagination.endItem = $scope.pagination.startItem + $scope.pagination.showItemNumb - 1;
            }
        }
     }

    $scope.showLast = function() {
        console.log ('showLast');
        $scope.pagination.startItem = $scope.pagination.filteredItemNumb - $scope.pagination.showItemNumb;
        $scope.pagination.endItem = $scope.pagination.startItem + $scope.pagination.showItemNumb - 1;        
    }


    $scope.readBlog = function() {
        $http.get('db/readblog.php').then(
            function onSuccess(response) {
                console.log ('Read blog from db');
                console.log(`responce: response.status = ${response.status}`);
                $scope.blog = response.data;
                console.log('Number of posts = ' + $scope.blog.length);
            }, 
            function onError(response) {
                console.log(`responce: response.status = ${response.status}`);
                console.log(`responce: response.statustext = ${response.statustext}`);
            }
        );
    }    

    $scope.createPost = function() {
        $scope.post = {};
        $scope.blogCurrentView = 'write';
    }

    $scope.cancelPublish = function() {
        $scope.post = {};
        $scope.blogCurrentView = 'read';
    }    
    
    $scope.publishPost = function() {
        $scope.post.writerID = $scope.user.id;
        $scope.post.writer = $scope.user.name;
        if ($scope.user.firstName) $scope.post.writer += (' as ' + $scope.user.firstName);
        if ($scope.user.lastName) $scope.post.writer +=  (' ' + $scope.user.lastName);
        var sendData = $scope.post;
        $http({method: 'POST', url: 'db/publishpost1.php', data: sendData}).
        then(
            function onSuccess(response) {
                console.log ('Publish post to db');
                console.log(`responce: response.status = ${response.status}`);
                console.log (`response.data = ${response.data}`);
                $scope.blogCurrentView = 'read';
                $scope.readBlog(); 
                $scope.readCategory(); 
            }, 
            function onError(response) {
                console.log(`responce: response.status = ${response.status}`);
                console.log(`responce: response.statustext = ${response.statustext}`);
                console.log (`response.data = ${response.data}`);
            }
        );
    }            

    $scope.readBlog();
    $scope.readCategory(); 

    $scope.$watch('categShow', function (newValue, oldValue) {
        if (angular.isArray(newValue)) {
            var itemNumb = 0;
            for (var i=0; i<newValue.length; i++) {
                if (newValue[i]) {
                    itemNumb += $scope.category[i].numberOfItems;
                }
            }
            $scope.pagination.filteredItemNumb = itemNumb;
            if ($scope.pagination.filteredItemNumb <= $scope.pagination.showItemNumb)  {
                $scope.pagination.showItemNumb = $scope.pagination.filteredItemNumb;
            }  else {
                $scope.pagination.showItemNumb = $scope.pagination.showItemNumb0;
                if ($scope.pagination.filteredItemNumb <= $scope.pagination.showItemNumb) {
                    $scope.pagination.showItemNumb = $scope.pagination.filteredItemNumb;
                }
            }
            $scope.pagination.startItem = 0;
            $scope.pagination.endItem = $scope.pagination.startItem + $scope.pagination.showItemNumb - 1;
        }
        console.log('categShow oldValue - ' + oldValue + ', categShow newValue - ' + newValue);
        console.log('itemNumb = ' + itemNumb);
    }, true);

    $scope.$watch('categShowAll', function (newValue, oldValue) {
        if ((newValue) && angular.isArray($scope.category)) {
            for (var i=0; i<$scope.category.length; i++) {
                $scope.categShow[i] = true;
            }
        }
        console.log('categShowAll oldValue - ' + oldValue + ', categShowAll newValue - ' + newValue);
    });

    
    $scope.newUserReg = function() {
        $scope.logError = false;
        $scope.logCurrentView = 'reg';
        console.log('newUserReg');
    }

    $scope.addNewUser = function(newUser) {
        $scope.user = $scope.newUser;
        if ($scope.user.useCookies) {
            $cookies.userName = $scope.user.name; 
            $cookies.firstName =  $scope.user.firstName;
            $cookies.lastName =  $scope.user.lastName;
            $cookies.userEmail =  $scope.user.email;
            $cookies.userPassword =  $scope.user.password;
            console.log('addNewUser set cookies');
        };
        var sendData = $scope.user;
        $http({method: 'POST', url: 'db/adduser1.php', data: sendData}).
        then(
            function onSuccess(response) {
                if (response.data.name) {
                    $scope.user = response.data;
                    console.log ('Add new user ' + $scope.user.name);
                    console.log(`responce.status = ${response.status}`);
                    console.log (`response.data = ${response.data}`);
                    $scope.logCurrentView = 'welcome';                    
                } else {
                    console.log (response.data);
                    $scope.newUserReg();
                    alert('User ' + $scope.user.name + 'is already exists!');                    
                }
            }, 
            function onError(response) {
                console.log(`responce: response.status = ${response.status}`);
                console.log(`responce: response.statustext = ${response.statustext}`);
                console.log (`response.data = ${response.data}`);
            }
        );
    }            
    
    $scope.getError = function (error) {
        if (angular.isDefined(error)) {
            if (error.required) {
                    return "Empty field";
            } else if (error.email) {
                    return "Input valid email";
            }
        }
    }

    $scope.newUserLogin = function(newUser) {
        var sendData = newUser;
        $http({method: 'POST', url: 'db/confirmuser1.php', data: sendData}).
        then(
            function onSuccess(response) {
                if (response.data.name) {
                    $scope.user = response.data;
                    console.log ('Confirm user ' + $scope.user.name);
                    console.log(`responce.status = ${response.status}`);
                    console.log('name=' + $scope.user.name + ' id=' + $scope.user.id);
                    $scope.logCurrentView = 'welcome';                                     
                } else {
                    console.log (response.data);
                    $scope.cancelReg();
                    alert('User ' + $scope.newUser.name + 'or password is invalid!');
                }
            }, 
            function onError(response) {
                console.log(`Confirm user response.status = ${response.status}`);
                console.log(`response.statustext = ${response.statustext}`);
                console.log (`response.data = ${response.data}`);
            }
        );
    }            

    $scope.$watch('user.id', function (newValue, oldValue) {
        localStorage.userId = newValue;
        localStorage.userName = $scope.user.name;
        console.log('localStorageUPD, userId: oldValue=' + oldValue + ', newValue=' + newValue);
    }, true);    


}]);


app.filter("filterItemsByCategory", function () {
    return function (blog, showAll, categShow, categ) {
        if (angular.isArray(blog) && angular.isArray(categ) && !showAll) {
            var filteredBlog = [];
            for (var i=0; i < blog.length; i++) {
                var searchIndex = -1,
                    searchID = blog[i].categoryID;
                for (var j=0; j < categ.length; j++) {
                    if (categ[j].id === searchID) {
                        searchIndex = j;
                        break;
                    }
                }
                if (searchIndex<0 || categShow[searchIndex]) {
                    var it = blog[i];
                    filteredBlog.push(it); 
                } 
            }
            return filteredBlog;
        } else {
            return blog;
        }
    }
});

app.filter("filterPagination", function () {
    return function (blog, pagination) {
        if (angular.isArray(blog)) {
            var filteredBlog = [];
            for (var i=pagination.startItem; i < pagination.startItem + pagination.showItemNumb; i++) {
                var it = blog[i];
                filteredBlog.push(it); 
            }
            return filteredBlog;
        } else {
            return blog;
        }
    }
});

