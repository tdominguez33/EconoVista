import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testng.keyword.TestNGBuiltinKeywords as TestNGKW
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

WebUI.openBrowser('')

WebUI.navigateToUrl('http://localhost:4200/')

WebUI.click(findTestObject('Object Repository/Page_Econovista/div_Inflacin Esperada - REM20.8'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/img_INFLACIN ESPERADA PARA LOS PRXIMOS 12 M_9e45e9'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/div_Reservas27991 M USD'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/img_INFLACIN ESPERADA PARA LOS PRXIMOS 12 M_9e45e9'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/div_Dlar Oficial Minorista 1095.52'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/img_INFLACIN ESPERADA PARA LOS PRXIMOS 12 M_9e45e9'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/div_Dolar Oficial Mayorista 1066.04'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/img_INFLACIN ESPERADA PARA LOS PRXIMOS 12 M_9e45e9'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/div_Tasa29'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/img_INFLACIN ESPERADA PARA LOS PRXIMOS 12 M_9e45e9'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/div_Base Monetaria30759385 MM'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/img_INFLACIN ESPERADA PARA LOS PRXIMOS 12 M_9e45e9'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/div_CER 545.205'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/img_INFLACIN ESPERADA PARA LOS PRXIMOS 12 M_9e45e9'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/div_UVA 1373.61'))

WebUI.click(findTestObject('Object Repository/Page_Econovista/img_INFLACIN ESPERADA PARA LOS PRXIMOS 12 M_9e45e9'))

WebUI.closeBrowser()

