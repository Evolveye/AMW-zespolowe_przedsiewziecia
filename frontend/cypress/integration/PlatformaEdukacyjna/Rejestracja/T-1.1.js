/// <reference types="cypress" />
import "cypress-localstorage-commands"

import dane from "../Dane/dane.js"

describe('Test ID: T-1-1', () => {
    it(dane.rejestracja.t1_1.testName, () => {
      cy.visit(dane.address)
      //click "Zaloguj się"
      cy.contains('Rejestracja').click()
      //fill form
      cy.get('[name="name"]').type(dane.rejestracja.t1_1.imie)
      cy.get('[name="surname"]').type(dane.rejestracja.t1_1.nazwisko)
      cy.get('[name="email"]').type(dane.rejestracja.t1_1.email)
      cy.get('[name="password1"]').type(dane.rejestracja.t1_1.haslo1)
      cy.get('[name="password2"]').type(dane.rejestracja.t1_1.haslo2)
  
      cy.get('form > .neumorphizm').click()


    })
  })