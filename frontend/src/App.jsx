
import AppRouter from './router';
import { Toaster } from 'react-hot-toast';
import { toast } from 'react-hot-toast';



const App = () => {

  return(
    <>
    <Toaster
  position="top-center"
  reverseOrder={false}/>
  <AppRouter />
    </>
  ) 
};

export default App;
