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
import com.kms.katalon.core.webui.driver.DriverFactory as DriverFactory
import org.openqa.selenium.By as By
import org.openqa.selenium.WebDriver as WebDriver

WebUI.openBrowser('http://localhost:4200/')

WebDriver driver = DriverFactory.getWebDriver()

WebUI.delay(1)

WebUI.click(findTestObject('Object Repository/Page_Econovista/div_Reservas27991 M USD'))

WebUI.delay(1)

driver.findElement(By.xpath('//span[contains(text(), \'10A\')]')).click()

WebUI.delay(1)

driver.findElement(By.xpath('//span[contains(text(), \'5A\')]')).click()

WebUI.delay(1)

driver.findElement(By.xpath('//span[contains(text(), \'2A\')]')).click()

WebUI.delay(1)

driver.findElement(By.xpath('//span[contains(text(), \'1A\')]')).click()

WebUI.delay(1)

driver.findElement(By.xpath('//span[contains(text(), \'6M\')]')).click()

WebUI.delay(1)

driver.findElement(By.xpath('//span[contains(text(), \'3M\')]')).click()

WebUI.delay(1)

driver.findElement(By.xpath('//span[contains(text(), \'1M\')]')).click()

WebUI.delay(1)

driver.findElement(By.xpath('//span[contains(text(), \'1S\')]')).click()

WebUI.delay(1)

driver.findElement(By.xpath('//span[contains(text(), \'Limpiar\')]')).click()

WebUI.delay(1)

WebUI.click(findTestObject('Object Repository/Page_Econovista/img_RESERVAS INTERNACIONALES DEL BCRA_icon'))

WebUI.delay(1)

WebUI.closeBrowser()

