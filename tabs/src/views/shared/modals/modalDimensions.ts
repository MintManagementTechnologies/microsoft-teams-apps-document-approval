const modalHeaderHeight = 0;//70;

const defaultModal = {
   view: 'default',
   action: 'default',
   dimensions: {
      height: 700,
      width: 1200
   }
}

// subtract 70  height for taskModule header
const modals = [
   {
      view: 'memo',
      action: 'new',
      dimensions: {
         height: 700-modalHeaderHeight,
         width: 1200
      }
   },
   {
      view: 'memo',
      action: 'edit',
      dimensions: {
         height: 700-modalHeaderHeight,
         width: 1200
      }
   },
   {
      view: 'memo',
      action: 'view',
      dimensions: {
         height: 700-modalHeaderHeight,
         width: 1200
      }
   },
   {
      view: 'memo',
      action: 'approve',
      dimensions: {
         height: 700-modalHeaderHeight,
         width: 1200
      }
   },
   {
      view: 'memo',
      action: 'editactors',
      dimensions: {
         height: 700-modalHeaderHeight,
         width: 800
      }
   },
   {
      view: 'users',
      action: 'new',
      dimensions: {
         height: 400-modalHeaderHeight,
         width: 800
      }
   },
   {
      view: 'users',
      action: 'edit',
      dimensions: {
         height: 400-modalHeaderHeight,
         width: 800
      }
   },
   {
      view: 'users',
      action: 'delete',
      dimensions: {
         height: 400-modalHeaderHeight,
         width: 800
      }
   },
   {
      view: 'config',
      action: 'site',
      dimensions: {
         height: 400-modalHeaderHeight,
         width: 400
      }
   },
   {
      view: 'config',
      action: 'team',
      dimensions: {
         height: 400-modalHeaderHeight,
         width: 400
      }
   },
]

export const getDimensions = (_view: string = '', _action: string = ''): { height: number, width: number } => {
   const modalProps = modals.find(x => x.view === _view && x.action === _action);
   let result = modalProps ? modalProps.dimensions : defaultModal.dimensions;
   return result;
}