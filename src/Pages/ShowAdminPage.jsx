import React, {useState} from 'react';
import '../Style/ShowAdminPage.css';
const ShowAdminPage = () => {
    
    const [formData, setFormData] = useState({
        firstName: "Mehrab",
        lastName: "Bozorgi",
        email: "Mehrabbozorgi.business@gmail.com",
        address: "33062 Zboncak Isle",
        contact: "58077.79",
        city: "Mehrab",
        state: "Bozorgi",
        password: "sbdfbnd65sfdvb s",
      });

      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: e.target.value,
        });
        // alert(e.target.value);
      };
    const handleSubmit = (e) => {
        //When the admin clicks on the submit button it will make a request to submit
        //& save the entered data
    }; 
    return (
        <div className='profilePage'>
            <div className="containerOfProfilePage">
                <div className='headerOfProfilePage'>
                    <h2 className='textOfHeaderOfProfilePage'>Profile</h2>
                    <img className='imageOfHeaderOfProfilePage' src="../../public/OLP.jpg" alt="" />
                </div>
                <form className='dataOfProfilePage' onSubmit={handleSubmit()}>
                    <div className='firstNameAndLastNameContainerInProfilePage'>
                        <div className='firstNameFieldInProfilePage'>
                            <p style={{width: '100px'}}>Firstname</p>
                            <input type='text' name='firstName' value={`${formData.firstName}`} onChange={handleChange} className='firstNameInputField'></input>
                        </div>
                        <div className='lastNameFieldInProfilePage'>
                            <p style={{width: '100px'}}>Lastname</p>
                            <input type='text' name='lastName' value={`${formData.lastName}`} onChange={handleChange} className='lastNameInputField'></input>
                        </div>
                    </div>
                    <div className='emailFieldInProfilePage'>
                        <p>Email</p>
                        <input type='email' name='email' value={`${formData.email}`} onChange={handleChange} className='emailInputField'></input>
                    </div>
                    <div className='addressFieldInProfilePage'>
                        <p>Address</p>
                        <input type='text' name='address' value={`${formData.address}`} onChange={handleChange} className='addressInputField'></input>
                    </div>
                    <div className='numberFieldInProfilePage'>
                        <p>Contact Number</p>
                        <input type='number' name='contact' value={`${formData.contact}`} onChange={handleChange} className='numberInputField'></input>
                    </div>
                    <div className='passwordFieldInProfilePage'>
                        <p>Password</p>
                        <input type='password' name='password' value={`${formData.password}`} onChange={handleChange} className='passwordInputField'></input>
                    </div>
                    <div className='submitButtonInProfilePage'>
                        <input type="button" value="Submit Changes" className='submitButton' />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ShowAdminPage;
