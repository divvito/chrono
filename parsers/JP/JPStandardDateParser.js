/*
  
  
*/

(function () {
  
  if(typeof chrono == 'undefined')
    throw 'Cannot find the chrono main module';
  
  var PATTERN = /(同|([0-9０-９]{2,4})年)?\s*([0-9０-９]{1,2})月\s*([0-9０-９]{1,2})日/i;
  
  function cleanZengakuNumber(str){
		
		var cleanStr = str; 
		cleanStr = cleanStr.replace(/０/g,'0');
		cleanStr = cleanStr.replace(/１/g,'1');
		cleanStr = cleanStr.replace(/２/g,'2');
		cleanStr = cleanStr.replace(/３/g,'3');
		cleanStr = cleanStr.replace(/４/g,'4');
		cleanStr = cleanStr.replace(/５/g,'5');
		cleanStr = cleanStr.replace(/６/g,'6');
		cleanStr = cleanStr.replace(/７/g,'7');
		cleanStr = cleanStr.replace(/８/g,'8');
		cleanStr = cleanStr.replace(/９/g,'9');
		return cleanStr;
	}
  
  
  /**
   * GeneralDateParser - Create a parser object
   *
   * @param  { String }           text - Orginal text to be parsed
   * @param  { Date, Optional }   ref  - Referenced date
   * @param  { Object, Optional } opt  - Parsing option
   * @return { CNParser } 
   */
  function JPStandardDateParser(text, ref, opt){
    
    opt = opt || {};
    ref = ref || new Date();
    var parser = chrono.Parser(text, ref, opt);
    
    parser.pattern = function() { return PATTERN; }
    
    parser.extract = function(full_text,index){ 
      
      var results = this.results();
      var lastResult = results[results.length -1];
      if( lastResult ){
        //Duplicate...
        if( index < lastResult.index + lastResult.text.length )
          return null;
      }
      
      var matchedTokens = full_text.substr(index).match(PATTERN);
  		if(matchedTokens == null){
  			finished = true;
  			return;
  		}

  		var text = matchedTokens[0].toLowerCase();
  		var date = null;
  		text = matchedTokens[0];
  		
  		var months = matchedTokens[3];
  		months = cleanZengakuNumber(months);
  		months = parseInt(months);
      if(!months || months == NaN) return null;
      
  		var days = matchedTokens[4];
  		days = cleanZengakuNumber(days);
  		days = parseInt(days);
  		if(!days || days == NaN) return null;

  		var years = matchedTokens[2];
  		if(years){
  		  years = cleanZengakuNumber(years);
    		years = parseInt(years);
  		}
  		
  		if(years && years !== NaN){

  			var dateText = years + '-'+months+'-'+days;
  			date = moment(dateText, 'YYYY-MM-DD');

  			if(date.format('YYYY-M-D') != dateText) date = null;

  		}else{

  			var dateText = months+'-'+days;
  			date = moment(dateText, 'MM-DD');
  			date.year(moment(ref).year());

  			var nextYear = date.clone().add('y',1);
  			var lastYear = date.clone().add('y',-1);

  			if( Math.abs(nextYear.diff(moment(ref))) < Math.abs(date.diff(moment(ref))) ){	
  				date = nextYear;
  			}
  			else if( Math.abs(lastYear.diff(moment(ref))) < Math.abs(date.diff(moment(ref))) ){	
  				date = lastYear;
  			}
  		}
  		
      var result = new chrono.ParseResult({
        referenceDate:ref,
        text:text,
        index:index,
        start:{
          day:date.date(),
          month:date.month(),
          year:date.year()
        }
      })
      
      var resultWithTime = parser.extractTime(full_text,result);
      result = resultWithTime || result;      
      return result;
    };
    
  	return parser;
  }
  
  chrono.parsers.JPStandardDateParser = JPStandardDateParser;
})();
