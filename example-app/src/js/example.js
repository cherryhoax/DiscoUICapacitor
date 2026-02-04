import { DiscoUI } from 'discoui-capacitor';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    DiscoUI.echo({ value: inputValue })
}
