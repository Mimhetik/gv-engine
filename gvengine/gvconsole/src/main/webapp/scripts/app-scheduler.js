angular.module('gvconsole')
.service('SchedulerService', ['$http', function($http){

 	var endpoint = 'http://localhost:8181/cxf/gvscheduler';
 	
 	this.getAll = function() {
 		return $http.get(endpoint + '/schedules');
 	}
 	
 	this.get = function(id) {
 		return $http.get(endpoint + '/schedules/' +id);
 	}
 	
 	this.pause = function(id) {
 		return $http.put(endpoint + '/schedules/' +id +'/pause')
 	}
 	
 	this.resume = function(id) {
 		return $http.put(endpoint + '/schedules/' +id +'/resume')
 	}
 	
 	this.delete = function(id) {
 		return $http.delete(endpoint + '/schedules/' +id);
 	}
 	
 	this.create = function(service, operation, schedule) {
 		return $http.post(endpoint + '/schedule/'+ service + '/' + operation, schedule, {headers: {'Content-Type':'application/json'} });
 	}
}]);


angular.module('gvconsole')
.controller('ScheduleListController',['SchedulerService', '$scope', '$location', function(SchedulerService, $scope, $http, $location){
  
  var instance = this;

  this.alerts = [];

  this.list = [];
  this.currentPage = 1;
  this.loadList = function() {
	  SchedulerService.getAll().then(

      function(response){
        instance.alerts = [];
        instance.list = [];
        angular.forEach(response.data, function(entry, key) {
          instance.list.push(entry);
        });
      },
      function(response){
        switch (response.status) {

        case 401: case 403:
          $location.path('login');
          break;

        case 404:
            instance.alerts.push({type: 'warning', msg: 'GVScheduler module not found'});
            break;

        default:
          instance.alerts.push({type: 'danger', msg: 'Data not available'});
          break;
      }

      $scope.loadStatus = "error";
    });
  }

  instance.loadList();

}]);

angular.module('gvconsole')
	.controller('ScheduleFormController', ['ConfigService', 'SchedulerService', '$scope','$http', '$location', 
				function(ConfigService, SchedulerService, $scope, $http, $location){

    $scope.cronConfig = {
  		allowMultiple: true
  	}
    
    $scope.alerts = [];
    $scope.operations = [];
    
    
    ConfigService.getServices().then(
    	function(response) {	
		    angular.forEach(response.data, function(service, sName) {
		    	angular.forEach(service.operations, function(operation, oName) {
		    		$scope.operations.push({ service: sName, operation: oName, key: sName+'/'+oName});
		    	});		        
		    });
    	},
    	function(response){
            switch (response.status) {

            case 401: case 403:
              $location.path('login');
              break;

            default:
              instance.alerts.push({type: 'danger', msg: 'Data not available'});
              break;
          }
    	});
    
    $scope.flow = {service: null, operation: null, key: null};
    $scope.schedule = {};

	$scope.addParameter = function(){
      
		if ($scope.schedule.properties == undefined) {
			$scope.schedule.properties = {};
		}
      
		if ($scope.key && $scope.key.trim().length > 0) {
			   $scope.schedule.properties[$scope.key]= $scope.value;
			   $scope.key = '';
			   $scope.value = '';
		}
	};
	
	$scope.save = function(){
		SchedulerService.create($scope.flow.service, $scope.flow.operation, $scope.schedule)
	}
	
	$scope.removeParameter=function(key){
		 delete $scope.schedule.properties[key];
	};

}]);