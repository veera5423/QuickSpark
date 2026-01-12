
import AppRouter from './router';



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
