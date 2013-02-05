// Form Highlight & Undo v0.0.1 - a full featured, light-weight, customizable form change detection and handler script.
// When working with pre-existing data from forms. This script will detect changes in the form
// Copyright (c) 2012 Christopher Hacia git@chrishacia.com
// Website: http://www.chrishacia.com/scripts/form-highlight
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

//Example Usage
//var form_object = '';
//$('#selector').live('change', function(e){e.stopPropagation();highlightChanges('.form_selector', form_object, '#save, #undo');});
//$(document).ready(function(){form_object = findAllFormElements('.form_selector');});



//NOTES:
// -- 2013-02-01: Fix a problem that appears to happen when objects that are not watched by "change" events break the highlighting.
//					It seems as such as the "Changed Element counts get thrown off

var show_unsaved_warning = false;

function findAllFormElements(formElem)
{
	//detect all form elemets on the page in a given form/container
	formObj = {};
	$(formElem).find(':input').each(function(key, val)
	{
		// $(document).append(key+'<br>');
		var endVal = null;
		if($(val).getType() != 'button')
		{
			if($(val).getType() == 'radio' || $(val).getType() == 'checkbox')
			{
				if($(val).is(':checked'))
				{
					endVal = 'checked';
				}
				else
				{
					endVal = 'unchecked';
				}
			}
			else
			{
				if($(val).val() != null || $(val).val() != undefined || $(val).val() != ''){endVal = $(val).val();}
			}

/*
			if(formObj.hasOwnProperty($(val).attr('name')) !== -1)
			{
*/
				formObj[$(val).attr('name')] = {
										input_name: $(val).attr('name'),
										input_type: $(val).getType(),
										input_val: endVal
										};

				if($(val).getType() == 'radio' || $(val).getType() == 'checkbox')
				{
					var attr = $(this).attr('class');
					if (typeof attr !== 'undefined' && attr !== false)
					{
						formObj[$(val).attr('name')].realVal = $(val).val();
						formObj[$(val).attr('name')].className = attr;
					}
					else
					{
						formObj[$(val).attr('name')].realVal = null;
						formObj[$(val).attr('name')].className = null;
					}
				}
/*
			}
			else
			{
				alert(formObj.toString())
			}
*/
		}
	});
	 return formObj;
}


function highlightChanges(formElem, orgObj, buttons)
{
	highlightChangesX(formElem, orgObj, buttons, 'formCol_right');
}
function highlightChangesSmall(formElem, orgObj, buttons)
{
	highlightChangesX(formElem, orgObj, buttons, 'sm_formCol_right');
}
function highlightChangesX(formElem, orgObj, buttons, whichDiv)
{
	//compare all form elemets on the page in a given form/container
	//to that of its sister object, then if anything is different highlight the respective rows (buttons)
	//alert(orgObj);
	var formObj = {};
	var changes = 0;
	$(formElem).find(':input').each(function(key, val)
	{
		//moved class selection to loop due to adding support for multi
		//multi is a method of checking to see if a given changed element has/had a set
		//of hidden sub elements where if it does, show them, along with highlighting the
		//column the element is changed in.
		var whichClass = 'change_detected';
		if(whichDiv == 'sm_formCol_right')
		{
			whichClass = 'change_detected_sm';
		}
		// $(document).append(key+'<br>');
		var endVal = null;
		if($(val).getType() != 'button')
		{
			if($(val).getType() == 'radio' || $(val).getType() == 'checkbox')
			{
				if($(val).is(':checked'))
				{
					endVal = 'checked';
				}
				else
				{
					endVal = 'unchecked';
				}
			}
			else
			{
				if($(val).val() != null || $(val).val() != undefined || $(val).val() != ''){endVal = $(val).val();}
			}
			if(orgObj[$(val).attr('name')].input_val != endVal)
			{
				changes++;
				if($(val).data('multiple') == "yes")
				{
					whichClass = whichClass+'_multi';
					$(val).parents('div.'+whichDiv).find('.hiddenElem').show();
					$(val).parents('div.'+whichDiv).find('.hiddenElem').find(':input:eq(0)').focus();
					//.next(':input').focus();
					//$(':input:eq('+$(':input').index($(val))+1+')').focus();
				}
				$(val).parents('div.'+whichDiv).addClass(whichClass);
			}
			else
			{
				//multi support for form elements that change that have hidden sub fields.
				if($(val).data('multiple') == "yes")
				{
					whichClass = whichClass+'_multi';
				}

				if($(val).parents('div.'+whichDiv).hasClass(whichClass))
				{
					if(whichClass.match(/_multi/))
					{
						$(val).parents('div.'+whichDiv).find('.hiddenElem').hide();
					}
					$(val).parents('div.'+whichDiv).removeClass(whichClass);
				}
			}
		}
	});

	var elemY = ($(formElem).parent('div').children('div').innerHeight()+2);
	$(formElem).parent('div').css({height:elemY+'px'});
	if(changes > 0)
	{
		show_unsaved_warning = true;
		$(buttons).removeClass('gray').addClass('orange');
	}
	else
	{
		//alert($('.change_detected').length +'||'+ $('.change_detected_multi').length)
		if($('.change_detected').length <= 0 || $('.change_detected_multi').length)
		{
			show_unsaved_warning = false;
		}
		$(buttons).removeClass('orange').addClass('gray');
	}

	 return formObj;
}
function undoChanges(formElem, orgObj, buttons)
{
	$.each(orgObj, function(key, val)
	{
		if(val.input_type == 'radio' || val.input_type == 'checkbox')
		{
			if(val.input_val == 'checked')
			{
				$(formElem+' input[name="'+val.input_name+'"]').attr('checked', true);
			}
			else
			{
				$(formElem+' input[name="'+val.input_name+'"]').attr('checked', false);
			}
		}
		else
		{
			if(val.input_val == null || val.input_val == undefined || val.input_val == '')
			{
				$(formElem+' input[name="'+val.input_name+'"]').val('');
			}
			else
			{
				$(formElem+' input[name="'+val.input_name+'"]').val(val.input_val);
			}
		}
		highlightChanges(formElem, orgObj, buttons);
	});
}



function autoSaver(elem)
{
	var $elem = elem;
	var mnu = $elem.data('autosave');
	if(mnu !== '' && mnu !== null && mnu !== undefined)
	{
		typeof window[mnu] === "function" && window[mnu](elem);
	}
}

//additional functionality to the jquery lib to find the type of inputs we are working over for object creation
$.fn.getType = function(){ return this[0].tagName == "INPUT" ? $(this[0]).attr("type").toLowerCase() : this[0].tagName.toLowerCase(); }


$(document).ready(function()
{
	//binding a handler to the window in the event a user changes a form element
	//without saving this will prompt them to save before leaving.
	$(window).bind('beforeunload', function()
	{
		if(show_unsaved_warning == true)
		{
			return 'You have unsaved changes to your Configuration, are you sure you want to leave the page?';
		}
	});
});