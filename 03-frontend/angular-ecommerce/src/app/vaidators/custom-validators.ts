import { FormControl, ValidationErrors } from "@angular/forms";

export class CustomValidators {

    // whitespace validation
    static notOnlyWhitespace(control:FormControl): ValidationErrors{

        // check if string contains only whitespace
        if((control.value!= null) && (control.value.trim().length ===0)){
            return {'notOnlyWhitespace': true};
        }
        else{
            return null; // valid input
        }
    }
}
