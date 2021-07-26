function PetShopUI() {

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'


  // Disable all adopt buttons and reset text to 'Adopt'.
  this.disableButtons = () => {

    [...document.querySelectorAll('#pets-row button')]
      .forEach(button => {
        button.textContent = 'Adopt'
        button.setAttribute('disabled', null)
      })
  }


  // Update all buttons state and text according to the given array of adopters.
  this.updateButtons = adopters => {

    adopters.forEach((adopter, petId) => {
      const button = document.querySelector(`button[pet-id='${petId}']`)
      if (adopter !== ZERO_ADDRESS) {
        button.textContent = 'Adopted'
        button.setAttribute('disabled', null)
      }
      else {
        button.textContent = 'Adopt'
        button.removeAttribute('disabled')
      }
    })
  }


  // Load pets from the JSON file and set up the UI.
  this.init = (adoptPetCallback, connectButtonCallback) => {

    document.querySelector('.connect-button').addEventListener('click', connectButtonCallback)

    fetch('../pets.json')
      .then(response => response.json())
      .then(pets =>
        pets.map(pet => {
          const template = document.querySelector('#pet-template').cloneNode(true)
          document.querySelector('#pets-row').append(template)

          template.id = `pet-${pet.id}`
          template.removeAttribute('style')
          template.querySelector('.pet-name').textContent = pet.name
          template.querySelector('img').src = pet.picture
          template.querySelector('.pet-breed').textContent = pet.breed
          template.querySelector('.pet-age').textContent = pet.age
          template.querySelector('.pet-location').textContent = pet.location
          template.querySelector('button').setAttribute('pet-id', pet.id)
          template.querySelector('button').addEventListener('click', adoptPetCallback)
        }))
  }
}

window.PetShopUI = new PetShopUI()
