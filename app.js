var currencyApp = angular.module('CurrencyApp',['ui.bootstrap']);

currencyApp.service('currencyService',function($http,$cacheFactory){
   this.currencies = {
            AUD:{name:'AUD',display:'Australian Dollar'},
            BGN:{name:'BGN',display:'Bulgarian Lev'},
            BRL:{name:'BRL',display:'Brazilian Real'},
            CAD:{name:'CAD',display:'Canadian Dollar'},
            CHF:{name:'CHF',display:'Swiss Franc'},
            CNY:{name:'CNY',display:'Chinese Yuan'},
            CZK:{name:'CZK',display:'Czech Republic Koruna'},
            DKK:{name:'DKK',display:'Danish Krone'},
            EUR:{name:'EUR',display:'Euro'},
            GBP:{name:'GBP',display:'British Pound'},
            HKD:{name:'HKD',display:'Hong Kong Dollar'},
            HRK:{name:'HRK',display:'Croatian Kuna'},
            HUF:{name:'HUF',display:'Hungarian Forint'},
            IDR:{name:'IDR',display:'Indonesian Rupiah'},
            ILS:{name:'ILS',display:'Israeli New Sheqel'},
            INR:{name:'INR',display:'Indian Rupee Rs'},
            JPY:{name:'JPY',display:'Japanese Yen'},
            KRW:{name:'KRW',display:'South Korean Won'},
            MXN:{name:'MXN',display:'Mexican Peso'},
            MYR:{name:'MYR',display:'Malaysian Ringgit'},
            NOK:{name:'NOK',display:'Norwegian Krone'},
            NZD:{name:'NZD',display:'New Zealand Dollar'},
            PHP:{name:'PHP',display:'Philippine Peso'},
            PLN:{name:'PLN',display:'Polish Zloty'},
            RON:{name:'RON',display:'Romanian Leu'},
            RUB:{name:'RUB',display:'Russian Ruble'},
            SEK:{name:'SEK',display:'Swedish Krona'},
            SGD:{name:'SGD',display:'Singapore Dollar'},
            THB:{name:'THB',display:'Thai Baht'},
            TRY:{name:'TRY',display:'Turkish Lira'},
            USD:{name:'USD',display:'US Dollar $'},
            ZAR:{name:'ZAR',display:'South African Rand'}
        };
        
    this.cache=null;
    
    this.initCache=function(){
        var self=this;
        self.cache={};
        for(currency in this.currencies){
            var currentCurrency = this.currencies[currency];
            var promise = $http.get("http://api.fixer.io/latest?base="+currentCurrency.name, { cache: true }).then(
                function (data) {
                    self.cache[data.data.base]=data.data;
                    self.cache[data.data.base].lastConversionDataFetchTime=new Date().getTime();
                },
                function (http, status, fnc, httpObj ) {        
                    console.log('Conversion retrieval failed.',http,status,httpObj);
                }
            );
        }
        
    };   
    
    
    this.getConversionData = function(fromCurrency){
        var self=this;
        var conversionData;
        var currentTime = new Date().getTime();
        if(self.cache[fromCurrency] && ((currentTime-self.cache[fromCurrency].lastConversionDataFetchTime)/60000<5)){
            return self.cache[fromCurrency];            
        }else{
            //Refresh cached data every 5 minutes
            $http.get("http://api.fixer.io/latest?base="+fromCurrency, { cache: true }).then(
                function (data) {
                    self.cache[fromCurrency]=data.data;
                    self.cache[fromCurrency].lastConversionDataFetchTime=new Date().getTime();
                },
                function (http, status, fnc, httpObj ) {        
                    console.log('Conversion retrieval failed.',http,status,httpObj);
                }
            );
        }
        
        return self.cache[fromCurrency];
    };
    
    this.convert = function(data,amt,from,to) {
        var toAmt = 0;
        if(data && data.rates){
            if(data.rates[to]){
                var baseRate = data.rates[to];
                toAmt = baseRate*amt;
            }
        }
        return toAmt;
    };
});

currencyApp.controller('mainController',['$scope','currencyService',function($scope,currencyService){
    $scope.currencies = currencyService.currencies;    
    $scope.fromCurrency = '';
    $scope.toCurrency = '';
    $scope.fromAmount=1;
    $scope.toAmount=0;
    if(!currencyService.cache){
        currencyService.initCache();
    }    
    
    $scope.update=function(){
        var data = currencyService.getConversionData($scope.fromCurrency);
        $scope.toAmount = currencyService.convert(data,$scope.fromAmount,$scope.fromCurrency,$scope.toCurrency);
    };
}]);