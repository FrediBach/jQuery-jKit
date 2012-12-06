<?php

	// (c) 2012 by Fredi Bach
	
	header('Cache-Control: no-cache, must-revalidate');
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	header('Content-type: application/json');
	
	session_start();
	
	// Return Array
	$returnvalues = array();
	
	if ( isset($_POST['code']) && isset($_POST['recipient']) && $_POST['code'] == '123456' ){
		
		// Array mit Feldern, die nicht in der Email angezeigt werden
		$hiddenElements = array("submit","recipient","subject","jkit-requireds","sort","redirect","env_report","from","reply-to","key-names","code"); 
		
		$mailtext=''; 
	
		$requiredValues = getCSVValues($_POST['jkit-requireds'],","); 
		
		$keynames = array();
		if (isset($_POST['key-names'])){
			$ks = explode(',',trim($_POST['key-names']));
			if (count($ks) > 0){
				foreach($ks as $k){
					$s = explode(':',$k);
					$keynames[$s[0]] = $s[1];
				}
			}
		}
	
		foreach ($_POST as $key => $val) {
		
			$val = trim($val);
			$val = utf8_decode(trim($val)); 
		
			if(in_array($key, $requiredValues) && $val!='') {
				if (false !== ($arraykey = array_search($key,$requiredValues))) {
					if ($key == 'email' || $key == 'mailadresse'){
						if (reallyValidEmail($val)){
							unset($requiredValues[$arraykey]);
						}
					} else {
				    	unset($requiredValues[$arraykey]);
					}
				}
			}

			//Wert nicht Mailen wenns ein Hiddenfield ist
			if(!in_array($key,$hiddenElements)) {
				if (trim($val) != ''){
					$val = stripslashes($val);
					if (isset($keynames[$key])){
						$key = $keynames[$key];
					} else {
						$key = ucfirst($key);
	    			}
					$mailtext .= "\n$key:\n------------------------------------\n$val\n\n";
				}
			}
		} 
	
		if(count($requiredValues)==0 OR (isset($requiredValues[0]) && $requiredValues[0]=="")) {
			
			if (!isset($_POST['from']) || $_POST['from'] == ''){
				$_POST['from'] = 'osxcode@gmail.com';
			}
			
			if (!isset($_POST['reply-to']) || $_POST['reply-to'] == ''){
				$_POST['reply-to'] = 'osxcode@gmail.com';
			}
			
			$headers = "From: ".$_POST['from']."\r\n" .
		    "Reply-To: ".$_POST['reply-to']."\r\n" .
		    'X-Mailer: PHP/' . phpversion();
	    
			mail($_POST['recipient'], $_POST['subject'], $mailtext, $headers); 
		
			$returnvalues['sent'] = true;

		} else {
		
			foreach ($requiredValues as $key => $val){	
				$returnvalues['error'][] = $val;
			}
		
		}
	
		// return the array formated as a Json Object
		echo json_encode($returnvalues);
		
	} else {
		$returnvalues['sent'] = false;
		echo json_encode($returnvalues);
	}
	
	// Required Functions:

	function getCSVValues($string, $separator=",") {
	    $elements = explode($separator, $string);
	    for ($i = 0; $i < count($elements); $i++) {
	        $nquotes = substr_count($elements[$i], '"');
	        if ($nquotes %2 == 1) {
	            for ($j = $i+1; $j < count($elements); $j++) {
	                if (substr_count($elements[$j], '"') %2 == 1) { // Look for an odd-number of quotes
	                    // Put the quoted string's pieces back together again
	                    array_splice($elements, $i, $j-$i+1,
	                        implode($separator, array_slice($elements, $i, $j-$i+1)));
	                    break;
	                }
	            }
	        }
	        if ($nquotes > 0) {
	            // Remove first and last quotes, then merge pairs of quotes
	            $qstr =& $elements[$i];
	            $qstr = substr_replace($qstr, '', strpos($qstr, '"'), 1);
	            $qstr = substr_replace($qstr, '', strrpos($qstr, '"'), 1);
	            $qstr = str_replace('""', '"', $qstr);
	        }
	    }
	    return $elements;
	}

	function reallyValidEmail($email)
	{
	   $isValid = true;
	   $atIndex = strrpos($email, "@");
	   if (is_bool($atIndex) && !$atIndex)
	   {
	      $isValid = false;
	   }
	   else
	   {
	      $domain = substr($email, $atIndex+1);
	      $local = substr($email, 0, $atIndex);
	      $localLen = strlen($local);
	      $domainLen = strlen($domain);
	      if ($localLen < 1 || $localLen > 64)
	      {
	         // local part length exceeded
	         $isValid = false;
	      }
	      else if ($domainLen < 1 || $domainLen > 255)
	      {
	         // domain part length exceeded
	         $isValid = false;
	      }
	      else if ($local[0] == '.' || $local[$localLen-1] == '.')
	      {
	         // local part starts or ends with '.'
	         $isValid = false;
	      }
	      else if (preg_match('/\\.\\./', $local))
	      {
	         // local part has two consecutive dots
	         $isValid = false;
	      }
	      else if (!preg_match('/^[A-Za-z0-9\\-\\.]+$/', $domain))
	      {
	         // character not valid in domain part
	         $isValid = false;
	      }
	      else if (preg_match('/\\.\\./', $domain))
	      {
	         // domain part has two consecutive dots
	         $isValid = false;
	      }
	      else if (!preg_match('/^(\\\\.|[A-Za-z0-9!#%&`_=\\/$\'*+?^{}|~.-])+$/',
	                 str_replace("\\\\","",$local)))
	      {
	         // character not valid in local part unless 
	         // local part is quoted
	         if (!preg_match('/^"(\\\\"|[^"])+"$/',
	             str_replace("\\\\","",$local)))
	         {
	            $isValid = false;
	         }
	      }
	      if ($isValid && !(checkdnsrr($domain,"MX") || checkdnsrr($domain,"A")))
	      {
	         // domain not found in DNS
	         $isValid = false;
	      }
	   }
	   return $isValid;
	}
	
?>
